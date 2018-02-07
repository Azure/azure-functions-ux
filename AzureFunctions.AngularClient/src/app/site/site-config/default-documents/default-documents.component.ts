import { FeatureComponent } from 'app/shared/components/feature-component';
import { LogCategories } from './../../../shared/models/constants';
import { AfterViewInit, Component, Injector, Input, OnChanges, OnDestroy, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import { SiteConfig } from './../../../shared/models/arm/site-config';
import { SaveOrValidationResult } from './../site-config.component';
import { LogService } from './../../../shared/services/log.service';
import { PortalResources } from './../../../shared/models/portal-resources';
import { BusyStateScopeManager } from './../../../busy-state/busy-state-scope-manager';
import { CustomFormGroup } from './../../../controls/click-to-edit/click-to-edit.component';
import { ArmObj, ResourceId } from './../../../shared/models/arm/arm-obj';
import { CacheService } from './../../../shared/services/cache.service';
import { AuthzService } from './../../../shared/services/authz.service';
import { UniqueValidator } from 'app/shared/validators/uniqueValidator';
import { RequiredValidator } from 'app/shared/validators/requiredValidator';
import { TableCellTemplateDirective } from 'app/controls/table-cell/table-cell-template.directive';
import { ConfigTableWrapperComponent } from './../config-table-wrapper/config-table-wrapper.component';

@Component({
    selector: 'default-documents',
    templateUrl: './default-documents.component.html',
    styleUrls: ['./../site-config.component.scss']
})
export class DefaultDocumentsComponent extends FeatureComponent<ResourceId> implements OnChanges, OnDestroy, AfterViewInit {
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
    public initialized: boolean;
    public getNewItem: () => CustomFormGroup;

    private _busyManager: BusyStateScopeManager;
    private _saveError: string;
    private _requiredValidator: RequiredValidator;
    private _uniqueDocumentValidator: UniqueValidator;
    private _webConfigArm: ArmObj<SiteConfig>;

    @ViewChildren(TableCellTemplateDirective) cellTemplates: QueryList<TableCellTemplateDirective>;

    @ViewChild(ConfigTableWrapperComponent) configTableWrapper: ConfigTableWrapperComponent;

    constructor(
        private _cacheService: CacheService,
        private _fb: FormBuilder,
        private _translateService: TranslateService,
        private _logService: LogService,
        private _authZService: AuthzService,
        injector: Injector
    ) {
        super('DefaultDocumentComponent', injector);
        this._busyManager = new BusyStateScopeManager(this._broadcastService, 'site-tabs');

        this.getNewItem =
            () => {
                return (this._fb.group({
                    name: [
                        null,
                        Validators.compose([
                            this._requiredValidator.validate.bind(this._requiredValidator),
                            this._uniqueDocumentValidator.validate.bind(this._uniqueDocumentValidator)])],
                    value: [null]
                }) as CustomFormGroup);
            };

        this._resetPermissionsAndLoadingState();
    }

    protected setup(inputEvents: Observable<ResourceId>) {
        return inputEvents
            .distinctUntilChanged()
            .switchMap(() => {
                this._busyManager.setBusy();
                this._saveError = null;
                this._webConfigArm = null;
                this.groupArray = null;
                this._resetPermissionsAndLoadingState();
                return Observable.zip(
                    this._authZService.hasPermission(this.resourceId, [AuthzService.writeScope]),
                    this._authZService.hasReadOnlyLock(this.resourceId),
                    (wp, rl) => ({ writePermission: wp, readOnlyLock: rl }));
            })
            .mergeMap(p => {
                this._setPermissions(p.writePermission, p.readOnlyLock);
                return Observable.zip(
                    Observable.of(this.hasWritePermissions),
                    this._cacheService.postArm(`${this.resourceId}/config/web`, true),
                    (h, w) => ({ hasWritePermissions: h, webConfigResponse: w }));
            })
            .do(null, error => {
                this._logService.error(LogCategories.defaultDocuments, '/default-documents', error);
                this._setupForm(null);
                this.loadingFailureMessage = this._translateService.instant(PortalResources.configLoadFailure);
                this.loadingMessage = null;
                this.showPermissionsMessage = true;
                this._busyManager.clearBusy();
            })
            .retry()
            .do(r => {
                this._webConfigArm = r.webConfigResponse.json();
                this._setupForm(this._webConfigArm);
                this.loadingMessage = null;
                this.showPermissionsMessage = true;
                this._busyManager.clearBusy();
            });
    }

    ngAfterViewInit() {
        setTimeout(() => { this.initialized = true; });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['resourceId']) {
            this.setInput(this.resourceId);
        }
        if (changes['mainForm'] && !changes['resourceId']) {
            this._setupForm(this._webConfigArm);
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this._busyManager.clearBusy();
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


    private _setupForm(webConfigArm: ArmObj<SiteConfig>) {
        if (!!webConfigArm) {
            if (!this._saveError || !this.groupArray) {
                this.groupArray = this._fb.array([]);

                this._requiredValidator = new RequiredValidator(this._translateService);
                this._uniqueDocumentValidator = new UniqueValidator(
                    'name',
                    this.groupArray,
                    this._translateService.instant(PortalResources.validation_duplicateError));

                if (webConfigArm.properties.defaultDocuments) {
                    webConfigArm.properties.defaultDocuments.forEach(document => {
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
            }

            if (this.mainForm.contains('defaultDocs')) {
                this.mainForm.setControl('defaultDocs', this.groupArray);
            } else {
                this.mainForm.addControl('defaultDocs', this.groupArray);
            }
        } else {
            this.groupArray = null;
            if (this.mainForm.contains('defaultDocs')) {
                this.mainForm.removeControl('defaultDocs');
            }
        }

        this._saveError = null;
    }

    validate(): SaveOrValidationResult {
        const result = {
            success: false,
            error: this._validationFailureMessage()
        };

        if (this.configTableWrapper && this.configTableWrapper.configTable) {
            this.configTableWrapper.configTable.purgePristineNewItems();
            this.configTableWrapper.configTable.validateAllControls();

            if (this.groupArray.valid) {
                result.success = true;
                result.error = null;
            }
        }

        return result;
    }

    save(): Observable<SaveOrValidationResult> {
        // Don't make unnecessary PATCH call if these settings haven't been changed
        if (this.groupArray.pristine) {
            return Observable.of({
                success: true,
                error: null
            });
        } else if (this.mainForm.contains('defaultDocs') && this.mainForm.controls['defaultDocs'].valid) {
            const defaultDocGroups = this.groupArray.controls;

            const webConfigArm: ArmObj<any> = JSON.parse(JSON.stringify(this._webConfigArm));
            webConfigArm.properties = {};

            webConfigArm.properties.defaultDocuments = [];
            defaultDocGroups.forEach(group => {
                if ((group as CustomFormGroup).msExistenceState !== 'deleted') {
                    webConfigArm.properties.defaultDocuments.push((group as FormGroup).controls['name'].value);
                }
            });

            return this._cacheService.patchArm(`${this.resourceId}/config/web`, null, webConfigArm)
                .map(webConfigResponse => {
                    this._webConfigArm = webConfigResponse.json();
                    return {
                        success: true,
                        error: null
                    };
                })
                .catch(error => {
                    this._saveError = error._body;
                    return Observable.of({
                        success: false,
                        error: error._body
                    });
                });
        } else {
            const failureMessage = this._validationFailureMessage();
            this._saveError = failureMessage;
            return Observable.of({
                success: false,
                error: failureMessage
            });
        }
    }

    private _validationFailureMessage(): string {
        const configGroupName = this._translateService.instant(PortalResources.feature_defaultDocumentsName);
        return this._translateService.instant(PortalResources.configUpdateFailureInvalidInput, { configGroupName: configGroupName });
    }
}
