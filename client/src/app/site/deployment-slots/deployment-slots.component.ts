import { Component, Injector, Input, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { TreeViewInfo, SiteData } from 'app/tree-view/models/tree-view-info';
import { CustomFormControl } from 'app/controls/click-to-edit/click-to-edit.component';
import { FeatureComponent } from 'app/shared/components/feature-component';
import { ArmObj, ResourceId } from 'app/shared/models/arm/arm-obj';
import { Site } from 'app/shared/models/arm/site';
import { SiteConfig } from 'app/shared/models/arm/site-config';
import { Links, LogCategories, SiteTabIds } from 'app/shared/models/constants';
import { PortalResources } from 'app/shared/models/portal-resources';
import { RoutingRule } from 'app/shared/models/arm/routing-rule';
import { ArmSiteDescriptor } from 'app/shared/resourceDescriptors';
import { AuthzService } from 'app/shared/services/authz.service';
import { CacheService } from 'app/shared/services/cache.service';
import { LogService } from 'app/shared/services/log.service';
import { SiteService } from 'app/shared/services/site.service';
import { PortalService } from 'app/shared/services/portal.service';
import { RoutingSumValidator } from 'app/shared/validators/routingSumValidator';
import { DecimalRangeValidator } from 'app/shared/validators/decimalRangeValidator';

// TODO [andimarc]: disable all controls when the sidepanel is open

@Component({
    selector: 'deployment-slots',
    templateUrl: './deployment-slots.component.html',
    styleUrls: ['./deployment-slots.component.scss', './common.scss']
})
export class DeploymentSlotsComponent extends FeatureComponent<TreeViewInfo<SiteData>> implements OnDestroy {
    public Resources = PortalResources;
    public FwdLinks = Links;
    public SumValidator = RoutingSumValidator;
    public viewInfo: TreeViewInfo<SiteData>;
    public resourceId: ResourceId;

    public loadingFailed: boolean;
    public fetchingContent: boolean;
    public fetchingPermissions: boolean;
    public keepVisible: boolean;

    public featureSupported: boolean;
    public canUpgrade: boolean;

    public mainForm: FormGroup;
    public hasWriteAccess: boolean;
    public hasSwapAccess: boolean;

    public slotsQuotaMessage: string;
    public slotsQuotaScaleUp: () => void;

    public swapControlsOpen: boolean;
    public addControlsOpen: boolean;

    public dirtyMessage: string;

    public siteArm: ArmObj<Site>;
    public relativeSlotsArm: ArmObj<Site>[];

    private _siteConfigArm: ArmObj<SiteConfig>;

    private _isSlot: boolean;

    @Input() set viewInfoInput(viewInfo: TreeViewInfo<SiteData>) {
        this.setInput(viewInfo);
    }

    private _swapMode: boolean;
    @Input() set swapMode(swapMode: boolean) {
        // We don't expect this input to change after it is set for the first time,
        // but here we make sure to only react the first time the input is set.
        if (this._swapMode === undefined && swapMode !== undefined) {
            this._swapMode = swapMode;
        }
    }

    constructor(
        private _authZService: AuthzService,
        private _cacheService: CacheService,
        private _fb: FormBuilder,
        private _logService: LogService,
        private _portalService: PortalService,
        private _siteService: SiteService,
        private _translateService: TranslateService,
        injector: Injector) {

        super('SlotsComponent', injector, SiteTabIds.deploymentSlotsConfig);

        // TODO [andimarc]
        // For ibiza scenarios, this needs to match the deep link feature name used to load this in ibiza menu
        this.featureName = 'deploymentslots';
        this.isParentComponent = true;

        this.slotsQuotaScaleUp = () => {
            if (this._confirmIfDirty()) {
                this.scaleUp();
            }
        }
    }

    scaleUp() {
        this.setBusy();

        this._portalService.openBlade(
            {
                detailBlade: 'SpecPickerFrameBlade',
                detailBladeInputs: {
                    id: this.siteArm.properties.serverFarmId,
                    feature: 'scaleup',
                    data: null
                }
            },
            this.componentName)
            .subscribe(r => {
                this.clearBusy();
                this._logService.debug(LogCategories.siteConfig, `Scale up ${r.reason === 'childClosedSelf' ? 'succeeded' : 'cancelled'}`);
            });
    }

    refresh(keepVisible?: boolean) {
        if (this._confirmIfDirty()) {
            this.keepVisible = keepVisible;
            const viewInfo: TreeViewInfo<SiteData> = JSON.parse(JSON.stringify(this.viewInfo));
            this.setInput(viewInfo);
        }
    }

    protected setup(inputEvents: Observable<TreeViewInfo<SiteData>>) {
        return inputEvents
            .distinctUntilChanged()
            .switchMap(viewInfo => {
                this.viewInfo = viewInfo;

                this.loadingFailed = false;
                this.fetchingContent = true;
                this.fetchingPermissions = true;

                this.featureSupported = false;
                this.canUpgrade = false;

                this.hasWriteAccess = false;
                this.hasSwapAccess = false;

                this.slotsQuotaMessage = null;

                this.swapControlsOpen = false;
                this.addControlsOpen = false;

                this.siteArm = null;
                this.relativeSlotsArm = null;
                this._siteConfigArm = null;

                const siteDescriptor = new ArmSiteDescriptor(this.viewInfo.resourceId);

                this._isSlot = !!siteDescriptor.slot;
                this.resourceId = siteDescriptor.getTrimmedResourceId();

                const siteResourceId = siteDescriptor.getSiteOnlyResourceId();

                return Observable.zip(
                    this._siteService.getSite(siteResourceId),
                    this._siteService.getSlots(siteResourceId),
                    this._siteService.getSiteConfig(this.resourceId)
                );
            })
            .switchMap(r => {
                const siteResult = r[0];
                const slotsResult = r[1];
                const siteConfigResult = r[2];

                let success = true;

                // TODO [andimarc]: If only siteConfigResult fails, don't fail entire UI, just disable controls for routing rules
                if (!siteResult.isSuccessful) {
                    this._logService.error(LogCategories.deploymentSlots, '/deployment-slots', siteResult.error.result);
                    success = false;
                }
                if (!slotsResult.isSuccessful) {
                    this._logService.error(LogCategories.deploymentSlots, '/deployment-slots', slotsResult.error.result);
                    success = false;
                }
                if (!siteConfigResult.isSuccessful) {
                    this._logService.error(LogCategories.deploymentSlots, '/deployment-slots', siteConfigResult.error.result);
                    success = false;
                }

                if (success) {
                    this._siteConfigArm = siteConfigResult.result;

                    if (this._isSlot) {
                        this.siteArm = slotsResult.result.value.filter(s => s.id === this.resourceId)[0];
                        this.relativeSlotsArm = slotsResult.result.value.filter(s => s.id !== this.resourceId);
                        this.relativeSlotsArm.unshift(siteResult.result);
                    } else {
                        this.siteArm = siteResult.result;
                        this.relativeSlotsArm = slotsResult.result.value;
                    }

                    // TODO [andimarc]: Make sure scale-up control is not showm for Dynamic SKU
                    const sku = this.siteArm.properties.sku.toLowerCase();

                    let slotsQuota = 0;
                    if (sku === 'dynamic') {
                        slotsQuota = 2;
                        this.canUpgrade = false;
                    } else if (sku === 'standard') {
                        slotsQuota = 5;
                        this.canUpgrade = true;
                    } else if (sku === 'premium') {
                        slotsQuota = 20;
                        this.canUpgrade = false;
                    } else {
                        this.canUpgrade = true;
                    }

                    this.featureSupported = !!slotsQuota;

                    if (this.featureSupported && this.relativeSlotsArm && (this.relativeSlotsArm.length + 1) >= slotsQuota) {
                        let quotaMessage = this._translateService.instant(PortalResources.slotNew_quotaReached, { quota: slotsQuota });
                        if (this.canUpgrade) {
                            quotaMessage = quotaMessage + ' ' + this._translateService.instant(PortalResources.slotNew_quotaUpgrade);
                        }
                        this.slotsQuotaMessage = quotaMessage;
                    }
                }

                this.loadingFailed = !success;
                this.fetchingContent = false;
                this.keepVisible = false;

                this._setupForm();

                if (this._swapMode) {
                    this._swapMode = false;
                    if (success) {
                        setTimeout(_ => { this.showSwapControls(); });
                    }
                }

                this.clearBusyEarly();

                if (success) {
                    return Observable.zip(
                        this._authZService.hasPermission(this.resourceId, [AuthzService.writeScope]),
                        this._authZService.hasPermission(this.resourceId, [AuthzService.actionScope]),
                        this._authZService.hasReadOnlyLock(this.resourceId));
                } else {
                    return Observable.zip(
                        Observable.of(false),
                        Observable.of(false),
                        Observable.of(true)
                    );
                }
            })
            .do(r => {
                const hasWritePermission = r[0];
                const hasSwapPermission = r[1];
                const hasReadOnlyLock = r[2];

                this.hasWriteAccess = hasWritePermission && !hasReadOnlyLock;

                this.hasSwapAccess = this.hasWriteAccess && hasSwapPermission;

                this.fetchingPermissions = false;
            });
    }

    private _setupForm() {
        if (!!this.siteArm && !!this.relativeSlotsArm && !!this._siteConfigArm) {

            this.mainForm = this._fb.group({});

            const remainderControl = this._fb.control({ value: '', disabled: false });

            const routingSumValidator = new RoutingSumValidator(this._fb, this._translateService);
            const rulesGroup = this._fb.group({}, { validator: routingSumValidator.validate.bind(routingSumValidator) });

            this.relativeSlotsArm.forEach(siteArm => {
                const ruleControl = this._generateRuleControl(siteArm);
                rulesGroup.addControl(siteArm.name, ruleControl);
            })

            this.mainForm.addControl(RoutingSumValidator.REMAINDER_CONTROL_NAME, remainderControl);

            this.mainForm.addControl('rulesGroup', rulesGroup);

            this._validateRoutingControls();

            setTimeout(_ => { remainderControl.disable() });

        } else {
            this.mainForm = null;
        }
    }

    private _generateRuleControl(siteArm: ArmObj<Site>): FormControl {
        const rampUpRules = this._siteConfigArm.properties.experiments.rampUpRules;
        const ruleName = siteArm.type === 'Microsoft.Web/sites' ? 'production' : this.getSegment(siteArm.name, -1);
        const rule = !rampUpRules ? null : rampUpRules.filter(r => r.name === ruleName)[0];

        const decimalRangeValidator = new DecimalRangeValidator(this._translateService);
        return this._fb.control({ value: rule ? rule.reroutePercentage : 0, disabled: false }, decimalRangeValidator.validate.bind(decimalRangeValidator));
    }

    private _validateRoutingControls() {
        if (this.mainForm && this.mainForm.controls['rulesGroup']) {
            const rulesGroup = (this.mainForm.controls['rulesGroup'] as FormGroup);
            for (const name in rulesGroup.controls) {
                const control = (rulesGroup.controls[name] as CustomFormControl);
                control._msRunValidation = true;
                control.updateValueAndValidity();
            }
            rulesGroup.updateValueAndValidity();
        }
    }

    save() {
        this.dirtyMessage = this._translateService.instant(PortalResources.saveOperationInProgressWarning);

        if (this.mainForm.controls['rulesGroup'] && this.mainForm.controls['rulesGroup'].valid) {

            this.setBusy();
            let notificationId = null;

            this._portalService.startNotification(
                this._translateService.instant(PortalResources.configUpdating),
                this._translateService.instant(PortalResources.configUpdating))
                .first()
                .switchMap(s => {
                    notificationId = s.id;

                    const siteConfigArm = JSON.parse(JSON.stringify(this._siteConfigArm));
                    const rampUpRules = siteConfigArm.properties.experiments.rampUpRules as RoutingRule[];

                    const rulesGroup: FormGroup = (this.mainForm.controls['rulesGroup'] as FormGroup);
                    for (const name in rulesGroup.controls) {
                        const ruleControl = rulesGroup.controls[name];

                        if (!ruleControl.pristine) {
                            const nameParts = name.split('/');
                            const ruleName = nameParts.length === 0 ? 'production' : nameParts[1];
                            const index = rampUpRules.findIndex(r => r.name === ruleName);

                            if (!ruleControl.value) {
                                if (index >= 0) {
                                    rampUpRules.splice(index, 1);
                                }
                            } else {
                                if (index >= 0) {
                                    rampUpRules[index].reroutePercentage = ruleControl.value;
                                } else {
                                    const slotArm = this.relativeSlotsArm.find(s => s.name === name);

                                    if (slotArm) {
                                        rampUpRules.push({
                                            actionHostName: slotArm.properties.hostNames[0],
                                            reroutePercentage: ruleControl.value,
                                            changeStep: null,
                                            changeIntervalInMinutes: null,
                                            minReroutePercentage: null,
                                            maxReroutePercentage: null,
                                            changeDecisionCallbackUrl: null,
                                            name: ruleName
                                        });
                                    }
                                }
                            }
                        }
                    }

                    return this._cacheService.putArm(`${this.resourceId}/config/web`, null, siteConfigArm);
                })
                .do(null, error => {
                    this.dirtyMessage = null;
                    this._logService.error(LogCategories.deploymentSlots, '/deployment-slots', error);
                    this.clearBusy();
                    this._portalService.stopNotification(
                        notificationId,
                        false,
                        this._translateService.instant(PortalResources.configUpdateFailure) + JSON.stringify(error));
                })
                .subscribe(r => {
                    this.dirtyMessage = null;
                    this.clearBusy();
                    this._portalService.stopNotification(
                        notificationId,
                        true,
                        this._translateService.instant(PortalResources.configUpdateSuccess));

                    this._siteConfigArm = r.json();
                    this._setupForm();
                });

        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();

        this.clearBusy();
        this._broadcastService.clearDirtyState('swap-slot');
        this._broadcastService.clearDirtyState('add-slot');
    }

    private _confirmIfDirty(): boolean {
        let proceed = true;

        if (this.mainForm && this.mainForm.dirty) {
            proceed = confirm(this._translateService.instant(PortalResources.unsavedChangesWarning));
            if (proceed) {
                this._discard();
            }
        }

        return proceed;
    }

    private _discard() {
        this._setupForm();
    }

    discard() {
        if (this._confirmIfDirty()) {
            this._discard();
        }
    }

    showSwapControls() {
        if (this._confirmIfDirty()) {
            this.swapControlsOpen = true;
        }
    }

    showAddControls() {
        if (this._confirmIfDirty()) {
            this.addControlsOpen = true;
        }
    }

    hideControls(refresh: boolean) {
        this.swapControlsOpen = false;
        this.addControlsOpen = false;
        if (refresh) {
            // TODO [andimarc]: prompt to confirm refresh?
            this.refresh(true);
        }
    }

    openSlotBlade(resourceId: string) {
        if (resourceId) {
            this._portalService.openBladeDeprecated({
                detailBlade: 'AppsOverviewBlade',
                detailBladeInputs: { id: resourceId }
            },
                'deployment-slots'
            );
        }
    }

    getSegment(path: string, index: number): string {
        let segment = null;

        if (!!path) {
            const segments = path.split('/');

            index = (index < 0) ? segments.length + index : index;

            if (index >= 0 && index < segments.length) {
                segment = segments[index];
            }
        }

        return segment;
    }
}