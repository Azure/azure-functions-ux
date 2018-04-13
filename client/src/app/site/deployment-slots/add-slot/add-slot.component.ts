import { LogCategories, SiteTabIds } from 'app/shared/models/constants';
import { LogService } from 'app/shared/services/log.service';
import { Component, Injector, Input, OnDestroy, Output } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { SlotsService } from 'app/shared/services/slots.service';
import { AiService } from 'app/shared/services/ai.service';
import { ArmObj, ResourceId } from 'app/shared/models/arm/arm-obj';
import { Site } from 'app/shared/models/arm/site';
import { PortalService } from 'app/shared/services/portal.service';
import { RequiredValidator } from 'app/shared/validators/requiredValidator';
import { PortalResources } from 'app/shared/models/portal-resources';
import { SlotNameValidator } from 'app/shared/validators/slotNameValidator';
import { errorIds } from 'app/shared/models/error-ids';
import { AuthzService } from 'app/shared/services/authz.service';
import { FeatureComponent } from 'app/shared/components/feature-component';
import { ArmSiteDescriptor } from 'app/shared/resourceDescriptors';
import { SiteService } from 'app/shared/services/site.service';
import { SiteConfig } from 'app/shared/models/arm/site-config';
import { DropDownElement } from 'app/shared/models/drop-down-element';
import { CustomFormControl } from 'app/controls/click-to-edit/click-to-edit.component';

// TODO [andimarc]: disable all controls when an add operation is in progress

@Component({
    selector: 'add-slot',
    templateUrl: './add-slot.component.html',
    styleUrls: ['./add-slot.component.scss', './../common.scss']
})
export class AddSlotComponent extends FeatureComponent<ResourceId> implements OnDestroy {
    @Input() set resourceId(resourceId: ResourceId) {
        this.setInput(resourceId);
    }

    @Output() close: Subject<boolean>;

    public dirtyMessage: string;

    public Resources = PortalResources;
    public addForm: FormGroup;
    public hasCreateAcess: boolean;
    public slotsQuotaMessage: string;
    public isLoading = true;
    public creating: boolean;
    public created: boolean;
    public checkingConfigSrc: boolean;
    public configSrcReadFailure: string;
    public configSrcDropDownOptions: DropDownElement<string>[];

    private _slotConfig: SiteConfig;
    private _siteId: string;
    private _slotsArm: ArmObj<Site>[];

    constructor(
        private _fb: FormBuilder,
        private _siteService: SiteService,
        private _translateService: TranslateService,
        private _portalService: PortalService,
        private _aiService: AiService,
        private _slotService: SlotsService,
        private _logService: LogService,
        private _authZService: AuthzService,
        private _injector: Injector
    ) {
        super('AddSlotComponent', _injector, SiteTabIds.deploymentSlotsConfig);

        // TODO [andimarc]
        // For ibiza scenarios, this needs to match the deep link feature name used to load this in ibiza menu
        this.featureName = 'deploymentslots';
        this.isParentComponent = true;

        this.close = new Subject<boolean>();

        const nameCtrl = this._fb.control({ value: null, disabled: true });
        const cloneCtrl = this._fb.control({ value: false, disabled: true });
        const configSrcCtrl = this._fb.control({ value: null, disabled: true });

        this.addForm = this._fb.group({
            name: nameCtrl,
            clone: cloneCtrl,
            configSrc: configSrcCtrl
        });

        cloneCtrl.valueChanges
            .takeUntil(this.ngUnsubscribe)
            .distinctUntilChanged()
            .do(_ => {
                (nameCtrl as CustomFormControl)._msRunValidation = true;
                nameCtrl.updateValueAndValidity();
            })
            .subscribe(v => {
                if (!v) {
                    configSrcCtrl.clearValidators();
                    configSrcCtrl.clearAsyncValidators();
                    configSrcCtrl.setValue(null);
                    configSrcCtrl.disable();
                } else {
                    configSrcCtrl.enable();
                }
            });

        configSrcCtrl.valueChanges
            .takeUntil(this.ngUnsubscribe)
            .distinctUntilChanged()
            .do(_ => {
                (nameCtrl as CustomFormControl)._msRunValidation = true;
                nameCtrl.updateValueAndValidity();
            })
            .filter(v => !!v)
            .switchMap(srcId => {
                this.checkingConfigSrc = true;
                this.configSrcReadFailure = null;
                this._slotConfig = null;
                return Observable.zip(
                    this._siteService.getSiteConfig(srcId),
                    this._siteService.getAppSettings(srcId),
                    this._siteService.getConnectionStrings(srcId));
            })
            .subscribe(r => {
                const siteConfigResult = r[0];
                const appSettingsResult = r[1];
                const connectionStringsResult = r[2];

                if (siteConfigResult.isSuccessful && appSettingsResult.isSuccessful && connectionStringsResult.isSuccessful) {
                    this._slotConfig = siteConfigResult.result.properties;
                    this._slotConfig.appSettings = appSettingsResult.result.properties;
                    this._slotConfig.connectionStrings = connectionStringsResult.result.properties;
                } else {
                    this.configSrcReadFailure = "failure";
                }

                this.checkingConfigSrc = false;
            });
    }

    protected setup(inputEvents: Observable<ResourceId>) {
        return inputEvents
            .distinctUntilChanged()
            .switchMap(resourceId => {
                this.hasCreateAcess = false;
                this.slotsQuotaMessage = null;
                this.creating = false;
                this.isLoading = true;

                this.checkingConfigSrc = false;
                this.configSrcReadFailure = null;

                this.configSrcDropDownOptions = null;

                this._slotConfig = null;
                this._slotsArm = null;

                const siteDescriptor = new ArmSiteDescriptor(resourceId);
                this._siteId = siteDescriptor.getSiteOnlyResourceId();

                return Observable.zip(
                    this._siteService.getSite(this._siteId),
                    this._siteService.getSlots(this._siteId),
                    this._authZService.hasPermission(this._siteId, [AuthzService.writeScope]),
                    this._authZService.hasReadOnlyLock(this._siteId));
            })
            .do(r => {
                const siteResult = r[0];
                const slotsResult = r[1];
                const hasWritePermission = r[2];
                const hasReadOnlyLock = r[3];

                this.hasCreateAcess = hasWritePermission && !hasReadOnlyLock;

                let success = true;

                if (!siteResult.isSuccessful) {
                    this._logService.error(LogCategories.addSlot, '/add-slot', siteResult.error.result);
                    success = false;
                }
                if (!slotsResult.isSuccessful) {
                    this._logService.error(LogCategories.addSlot, '/add-slot', slotsResult.error.result);
                    success = false;
                }

                if (success) {
                    this._slotsArm = slotsResult.result.value;
                    this._slotsArm.unshift(siteResult.result);

                    const sku = siteResult.result.properties.sku.toLowerCase();

                    let slotsQuota = 0;
                    if (sku === 'dynamic') {
                        slotsQuota = 2;
                    } else if (sku === 'standard') {
                        slotsQuota = 5;
                    } else if (sku === 'premium') {
                        slotsQuota = 20;
                    }

                    if (this._slotsArm && this._slotsArm.length >= slotsQuota) {
                        this.slotsQuotaMessage = this._translateService.instant(PortalResources.slotNew_quotaReached, { quota: slotsQuota });
                    }
                }

                this._setupForm();
                this.isLoading = false;
            });
    }

    private _setupForm() {
        const nameCtrl = this.addForm.get('name');
        const cloneCtrl = this.addForm.get('clone')
        const configSrcCtrl = this.addForm.get('configSrc')

        if (!this.hasCreateAcess || !this._slotsArm) {

            nameCtrl.clearValidators();
            nameCtrl.clearAsyncValidators();
            nameCtrl.disable();

            cloneCtrl.clearValidators();
            cloneCtrl.clearAsyncValidators();
            cloneCtrl.setValue(false);
            cloneCtrl.disable();

            configSrcCtrl.clearValidators();
            configSrcCtrl.clearAsyncValidators();
            configSrcCtrl.setValue(null);
            configSrcCtrl.disable();

        } else if (this.hasCreateAcess) {

            const requiredValidator = new RequiredValidator(this._translateService);
            const slotNameValidator = new SlotNameValidator(this._injector, this._siteId);
            nameCtrl.setValidators(requiredValidator.validate.bind(requiredValidator));
            nameCtrl.setAsyncValidators(slotNameValidator.validate.bind(slotNameValidator));
            nameCtrl.enable();

            if (this._slotsArm && this._slotsArm.length > 0) {

                cloneCtrl.enable();
                configSrcCtrl.enable();

                const options: DropDownElement<string>[] = [];
                this._slotsArm.forEach(s => {
                    options.push({
                        displayLabel: s.properties.name,
                        value: s.id
                    });
                })
                this.configSrcDropDownOptions = options;

            } else {

                cloneCtrl.clearValidators();
                cloneCtrl.clearAsyncValidators();
                cloneCtrl.setValue(false);
                cloneCtrl.disable();

                configSrcCtrl.clearValidators();
                configSrcCtrl.clearAsyncValidators();
                configSrcCtrl.setValue(null);
                configSrcCtrl.disable();
            }
        }

    }

    // TODO [andimarc]: use configSrc control
    createSlot() {
        this.dirtyMessage = this._translateService.instant(PortalResources.slotCreateOperationInProgressWarning);

        const newSlotName = this.addForm.controls['name'].value;
        let notificationId = null;
        this.creating = true;
        this.setBusy();
        // show create slot start notification
        this._portalService.startNotification(
            this._translateService.instant(PortalResources.slotNew_startCreateNotifyTitle).format(newSlotName),
            this._translateService.instant(PortalResources.slotNew_startCreateNotifyTitle).format(newSlotName))
            .first()
            .switchMap(s => {
                notificationId = s.id;
                return this._slotService.createNewSlot(this._slotsArm[0].id, newSlotName, this._slotsArm[0].location, this._slotsArm[0].properties.serverFarmId);
            })
            .subscribe((r) => {
                this.creating = false;
                this.created = true;
                this.clearBusy();
                // TODO [andimarc]: refresh slots list
                // update notification
                this._portalService.stopNotification(
                    notificationId,
                    true,
                    this._translateService.instant(PortalResources.slotNew_startCreateSuccessNotifyTitle).format(newSlotName));
            }, err => {
                this.creating = false;
                this.clearBusy();
                this._portalService.stopNotification(
                    notificationId,
                    false,
                    this._translateService.instant(PortalResources.slotNew_startCreateFailureNotifyTitle).format(newSlotName));
                this.showComponentError({
                    message: this._translateService.instant(PortalResources.slotNew_startCreateFailureNotifyTitle).format(newSlotName),
                    details: this._translateService.instant(PortalResources.slotNew_startCreateFailureNotifyTitle).format(newSlotName),
                    errorId: errorIds.failedToCreateSlot,
                    resourceId: this._slotsArm[0].id
                });
                this._aiService.trackEvent(errorIds.failedToCreateApp, { error: err, id: this._slotsArm[0].id });
            });
    }

    closePanel() {
        const close = (!this.addForm || !this.addForm.dirty || this.created) ? true : confirm('unsaved changes will be lost'); // TODO [andimarc]: add to resources

        if (close) {
            this.close.next(!!this.created);
        }
    }
}