import { ConfigSaveComponent, ArmSaveConfigs } from 'app/shared/components/config-save-component';
import { LogCategories, SiteTabIds } from './../../../shared/models/constants';
import { LogService } from './../../../shared/services/log.service';
import { SiteService } from 'app/shared/services/site.service';
import { Component, Injector, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import { SiteConfig } from './../../../shared/models/arm/site-config';
import { PortalResources } from './../../../shared/models/portal-resources';
import { CustomFormControl, CustomFormGroup } from './../../../controls/click-to-edit/click-to-edit.component';
import { ArmObj, ResourceId } from './../../../shared/models/arm/arm-obj';
import { AuthzService } from './../../../shared/services/authz.service';
import { UniqueValidator } from 'app/shared/validators/uniqueValidator';
import { RequiredValidator } from 'app/shared/validators/requiredValidator';

@Component({
    selector: 'default-documents',
    templateUrl: './default-documents.component.html',
    styleUrls: ['./../site-config.component.scss']
})
export class DefaultDocumentsComponent extends ConfigSaveComponent implements OnChanges, OnDestroy {
    @Input() mainForm: FormGroup;
    @Input() resourceId: ResourceId;

    public Resources = PortalResources;
    public groupArray: FormArray;
    public hasWritePermissions: boolean;
    public permissionsMessage: string;
    public showPermissionsMessage: boolean;
    public showReadOnlySettingsMessage: string;
    public loadingFailureMessage: string;
    public loadingMessage: string;
    public newItem: CustomFormGroup;
    public originalItemsDeleted: number;

    private _requiredValidator: RequiredValidator;
    private _uniqueDocumentValidator: UniqueValidator;

    constructor(
        private _fb: FormBuilder,
        private _translateService: TranslateService,
        private _logService: LogService,
        private _authZService: AuthzService,
        private _siteService: SiteService,
        injector: Injector
    ) {
        super('DefaultDocumentComponent', injector, ['SiteConfig'], SiteTabIds.applicationSettings);

        this._resetPermissionsAndLoadingState();

        this.newItem = null;
        this.originalItemsDeleted = 0;
    }

    protected get _isPristine() {
        return this.groupArray && this.groupArray.pristine;
    }

    protected setup(inputEvents: Observable<ResourceId>) {
        return inputEvents
            .distinctUntilChanged()
            .switchMap(() => {
                this._saveFailed = false;
                this._resetSubmittedStates();
                this._resetConfigs();
                this.groupArray = null;
                this.newItem = null;
                this.originalItemsDeleted = 0;
                this._resetPermissionsAndLoadingState();

                return Observable.zip(
                    this._siteService.getSiteConfig(this.resourceId, true),
                    this._authZService.hasPermission(this.resourceId, [AuthzService.writeScope]),
                    this._authZService.hasReadOnlyLock(this.resourceId));
            })
            .do(results => {
                if (results[0].isSuccessful) {
                    this.siteConfigArm = results[0].result;
                    this._setPermissions(results[1], results[2]);
                    this._setupForm(this.siteConfigArm);
                } else {
                    this._logService.error(LogCategories.defaultDocuments, '/default-documents', results[0].error.result);
                    this._setupForm(null);
                    this.loadingFailureMessage = this._translateService.instant(PortalResources.configLoadFailure);
                }

                this.loadingMessage = null;
                this.showPermissionsMessage = true;
            });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['resourceId']) {
            this.setInput(this.resourceId);
        }
        if (changes['mainForm'] && !changes['resourceId']) {
            this._setupForm(this.siteConfigArm);
        }
    }

    private _resetPermissionsAndLoadingState() {
        this.hasWritePermissions = true;
        this.permissionsMessage = '';
        this.showPermissionsMessage = false;
        this.showReadOnlySettingsMessage = this._translateService.instant(PortalResources.configViewReadOnlySettings);
        this.loadingFailureMessage = '';
        this.loadingMessage = this._translateService.instant(PortalResources.loading);
    }

    private _setPermissions(writePermission: boolean, readOnlyLock: boolean) {
        if (!writePermission) {
            this.permissionsMessage = this._translateService.instant(PortalResources.configRequiresWritePermissionOnApp);
        } else if (readOnlyLock) {
            this.permissionsMessage = this._translateService.instant(PortalResources.configDisabledReadOnlyLockOnApp);
        } else {
            this.permissionsMessage = '';
        }

        this.hasWritePermissions = writePermission && !readOnlyLock;
    }

    private _setupForm(siteConfigArm: ArmObj<SiteConfig>) {
        if (!!siteConfigArm) {
            if (!this._saveFailed || !this.groupArray) {
                this.newItem = null;
                this.originalItemsDeleted = 0;
                this.groupArray = this._fb.array([]);

                this._requiredValidator = new RequiredValidator(this._translateService);
                this._uniqueDocumentValidator = new UniqueValidator(
                    'name',
                    this.groupArray,
                    this._translateService.instant(PortalResources.validation_duplicateError));

                if (siteConfigArm.properties.defaultDocuments) {
                    siteConfigArm.properties.defaultDocuments.forEach(document => {
                        const group = this._fb.group({
                            name: [
                                { value: document, disabled: !this.hasWritePermissions },
                                Validators.compose([
                                    this._requiredValidator.validate.bind(this._requiredValidator),
                                    this._uniqueDocumentValidator.validate.bind(this._uniqueDocumentValidator)])]
                        }) as CustomFormGroup;

                        group.msExistenceState = 'original';
                        this.groupArray.push(group);
                    });
                }

                this._validateAllControls(this.groupArray.controls as CustomFormGroup[]);
            }

            if (this.mainForm.contains('defaultDocs')) {
                this.mainForm.setControl('defaultDocs', this.groupArray);
            } else {
                this.mainForm.addControl('defaultDocs', this.groupArray);
            }
        } else {
            this.newItem = null;
            this.originalItemsDeleted = 0;
            this.groupArray = null;
            if (this.mainForm.contains('defaultDocs')) {
                this.mainForm.removeControl('defaultDocs');
            }
        }

        this._saveFailed = false;
        this._resetSubmittedStates();
    }

    validate() {
        const groups = this.groupArray.controls;

        // Purge any added entries that were never modified
        for (let i = groups.length - 1; i >= 0; i--) {
            const group = groups[i] as CustomFormGroup;
            if (group.msStartInEditMode && group.pristine) {
                groups.splice(i, 1);
                if (group === this.newItem) {
                    this.newItem = null;
                }
            }
        }

        this._validateAllControls(groups as CustomFormGroup[]);
    }

    private _validateAllControls(groups: CustomFormGroup[]) {
        groups.forEach(group => {
            const controls = (<FormGroup>group).controls;
            for (const controlName in controls) {
                const control = <CustomFormControl>controls[controlName];
                control._msRunValidation = true;
                control.updateValueAndValidity();
            }
        });
    }

    protected _getConfigsFromForms(saveConfigs: ArmSaveConfigs): ArmSaveConfigs {
        const siteConfigArm: ArmObj<SiteConfig> = (saveConfigs && saveConfigs.siteConfigArm) ?
            JSON.parse(JSON.stringify(saveConfigs.siteConfigArm)) :
            JSON.parse(JSON.stringify(this.siteConfigArm));
        siteConfigArm.id = `${this.resourceId}/config/web`;
        siteConfigArm.properties.defaultDocuments = [];

        const defaultDocuments: string[] = siteConfigArm.properties.defaultDocuments;

        this.groupArray.controls.forEach(group => {
            if ((group as CustomFormGroup).msExistenceState !== 'deleted') {
                defaultDocuments.push((group as FormGroup).controls['name'].value);
            }
        });

        return {
            siteConfigArm: siteConfigArm
        };
    }

    deleteItem(group: FormGroup) {
        const groups = this.groupArray;
        const index = groups.controls.indexOf(group);
        if (index >= 0) {
            if ((group as CustomFormGroup).msExistenceState === 'original') {
                this._deleteOriginalItem(groups, group);
            } else {
                this._deleteAddedItem(groups, group, index);
            }
        }
    }

    private _deleteOriginalItem(groups: FormArray, group: FormGroup) {
        // Keep the deleted group around with its state set to dirty.
        // This keeps the overall state of this.groupArray and this.mainForm dirty.
        group.markAsDirty();

        // Set the group.msExistenceState to 'deleted' so we know to ignore it when validating and saving.
        (group as CustomFormGroup).msExistenceState = 'deleted';

        // Force the deleted group to have a valid state by clear all validators on the controls and then running validation.
        for (const key in group.controls) {
            const control = group.controls[key];
            control.clearAsyncValidators();
            control.clearValidators();
            control.updateValueAndValidity();
        }

        this.originalItemsDeleted++;

        groups.updateValueAndValidity();
    }

    private _deleteAddedItem(groups: FormArray, group: FormGroup, index: number) {
        // Remove group from groups
        groups.removeAt(index);
        if (group === this.newItem) {
            this.newItem = null;
        }

        // If group was dirty, then groups is also dirty.
        // If all the remaining controls in groups are pristine, mark groups as pristine.
        if (!group.pristine) {
            let pristine = true;
            for (const control of groups.controls) {
                pristine = pristine && control.pristine;
            }

            if (pristine) {
                groups.markAsPristine();
            }
        }

        groups.updateValueAndValidity();
    }

    addItem() {
        const groups = this.groupArray;

        this.newItem = this._fb.group({
            name: [
                null,
                Validators.compose([
                    this._requiredValidator.validate.bind(this._requiredValidator),
                    this._uniqueDocumentValidator.validate.bind(this._uniqueDocumentValidator)])],
            value: [null]
        }) as CustomFormGroup;

        this.newItem.msExistenceState = 'new';
        this.newItem.msStartInEditMode = true;
        groups.push(this.newItem);
    }
}
