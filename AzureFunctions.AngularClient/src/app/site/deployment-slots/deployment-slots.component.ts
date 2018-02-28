//import { BroadcastService } from './../../shared/services/broadcast.service';
import { Component, Injector, Input, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
//import { Subject } from 'rxjs/Subject';
//import { Subscription as RxSubscription } from 'rxjs/Subscription';
import { FormBuilder, FormGroup } from '@angular/forms';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/zip';
import { TranslateService } from '@ngx-translate/core';
import { TreeViewInfo, SiteData } from 'app/tree-view/models/tree-view-info';
import { CustomFormGroup } from 'app/controls/click-to-edit/click-to-edit.component';
import { FeatureComponent } from 'app/shared/components/feature-component';
import { ArmObj, ResourceId } from 'app/shared/models/arm/arm-obj';
import { Site } from 'app/shared/models/arm/site';
import { SiteConfig } from 'app/shared/models/arm/site-config';
import { LogCategories } from 'app/shared/models/constants';
import { PortalResources } from 'app/shared/models/portal-resources';
import { ArmSiteDescriptor } from 'app/shared/resourceDescriptors';
import { AuthzService } from 'app/shared/services/authz.service';
import { LogService } from 'app/shared/services/log.service';
import { SiteService } from 'app/shared/services/site.service';
import { PortalService } from 'app/shared/services/portal.service';

@Component({
    selector: 'slots',
    templateUrl: './deployment-slots.component.html',
    styleUrls: ['./deployment-slots.component.scss']
})
export class DeploymentSlotsComponent extends FeatureComponent<TreeViewInfo<SiteData>> implements OnDestroy {
    public Resources = PortalResources;

    public mainForm: FormGroup;
    public hasWriteAccess: boolean;
    public hasSwapAccess: boolean;

    public leftoverPct: string;
    public swapControlsOpen: boolean;
    public swapSrc: string;
    public swapDest: string;

    public dirtyMessage: string;

    public siteArm: ArmObj<Site>;

    private _relativeSlotsArm: ArmObj<Site>[];
    private _siteConfigArm: ArmObj<SiteConfig>;

    private _resourceId: ResourceId;
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
        public ts: TranslateService,
        private _authZService: AuthzService,
        private _fb: FormBuilder,
        private _logService: LogService,
        private _portalService: PortalService,
        private _siteService: SiteService,
        injector: Injector) {

        super('SlotsComponent', injector, 'site-tabs');

        // For ibiza scenarios, this needs to match the deep link feature name used to load this in ibiza menu
        this.featureName = 'deploymentslots';
        this.isParentComponent = true;
    }

    protected setup(inputEvents: Observable<TreeViewInfo<SiteData>>) {
        return inputEvents
            .distinctUntilChanged()
            .switchMap(viewInfo => {
                this.hasWriteAccess = false;
                this.hasSwapAccess = false;

                this.swapControlsOpen = false;
                this.swapSrc = null;
                this.swapDest = null;

                this._relativeSlotsArm = null;
                this.siteArm = null;
                this._siteConfigArm = null;

                const siteDescriptor = new ArmSiteDescriptor(viewInfo.resourceId);

                this._isSlot = !!siteDescriptor.slot;
                this._resourceId = siteDescriptor.getTrimmedResourceId();

                const siteResourceId = siteDescriptor.getSiteOnlyResourceId();

                return Observable.zip(
                    this._siteService.getSite(siteResourceId),
                    this._siteService.getSlots(siteResourceId),
                    this._siteService.getSiteConfig(this._resourceId)
                );
            })
            .switchMap(r => {
                const siteResult = r[0];
                const slotsResult = r[1];
                const siteConfigResult = r[2];

                const success = siteResult.isSuccessful && slotsResult.isSuccessful && siteConfigResult.isSuccessful;

                if (!success) {
                    if (!siteResult.isSuccessful) {
                        this._logService.error(LogCategories.deploymentSlots, '/deployment-slots', siteResult.error.result);
                    } else if (!slotsResult.isSuccessful) {
                        this._logService.error(LogCategories.deploymentSlots, '/general-settings', slotsResult.error.result);
                    } else {
                        this._logService.error(LogCategories.deploymentSlots, '/general-settings', siteConfigResult.error.result);
                    }
                } else {
                    this._siteConfigArm = siteConfigResult.result;

                    if (this._isSlot) {
                        this.siteArm = slotsResult.result.value.filter(s => s.id === this._resourceId)[0];
                        this._relativeSlotsArm = slotsResult.result.value.filter(s => s.id !== this._resourceId);
                        this._relativeSlotsArm.unshift(siteResult.result);
                    } else {
                        this.siteArm = siteResult.result;
                        this._relativeSlotsArm = slotsResult.result.value;
                    }
                }

                this._setupForm();

                if (this._swapMode) {
                    this._swapMode = false;

                    if (success) {
                        this.showSwapControls();
                    }
                }

                this.clearBusyEarly();

                if (success) {
                    return Observable.zip(
                        Observable.of(true),
                        this._authZService.hasPermission(this._resourceId, [AuthzService.writeScope]),
                        this._authZService.hasPermission(this._resourceId, [AuthzService.actionScope]),
                        this._authZService.hasReadOnlyLock(this._resourceId));
                } else {
                    return Observable.zip(
                        Observable.of(false));
                }


            })
            .do(r => {
                const loaded = r[0];

                if (loaded) {
                    const hasWritePermission = r[1];
                    const hasSwapPermission = r[2];
                    const hasReadOnlyLock = r[3];

                    this.hasWriteAccess = hasWritePermission && !hasReadOnlyLock;

                    if (this.hasWriteAccess && hasSwapPermission) {
                        if (this._isSlot) {
                            this.hasSwapAccess = true;
                        } else {
                            this.hasSwapAccess = this._relativeSlotsArm && this._relativeSlotsArm.length > 0;
                        }
                    }
                } else {
                    this.hasWriteAccess = false;
                    this.hasSwapAccess = false;
                }
            });
    }

    private _setupForm() {
        if (!!this.siteArm && !!this._relativeSlotsArm && !!this._siteConfigArm) {

            this.mainForm = this._fb.group({});

            const slotsGroupArray = this._fb.array([]);

            const rampUpRules = this._siteConfigArm.properties.experiments.rampUpRules;

            this._relativeSlotsArm.forEach(siteArm => {
                const ruleName = siteArm.type === 'Microsoft.Web/sites' ? 'production' : siteArm.name.split('/').slice(-1)[0];
                const rule = !rampUpRules ? null : rampUpRules.filter(r => r.name === ruleName)[0];

                const slotName = siteArm.properties.name;
                const pct = rule ? rule.reroutePercentage : 0;

                const group = this._fb.group({
                    name: [{ value: slotName, disabled: false }],
                    pct: [{ value: pct, disabled: false }],
                }) as CustomFormGroup;

                slotsGroupArray.push(group);
            })

            this.mainForm.setControl('slotsGroupArray', slotsGroupArray);

        } else {
            this.mainForm = null;
        }
    }

    save() {

    }

    discard() {
        this._setupForm();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();

        this.clearBusy();
        this._broadcastService.clearDirtyState('slot-swap');
        this._broadcastService.clearDirtyState('slot-add');
    }

    public showSwapControls(dest?: string) {
        this.swapControlsOpen = false;
        this.swapSrc = this.siteArm.name.split('/').slice(-1)[0];
        this.swapDest = null;

        dest = dest || this.siteArm.properties.targetSwapSlot;
        if (!dest && this._relativeSlotsArm) {
            const destSlot = this._relativeSlotsArm[0];
            if (destSlot) {
                dest = destSlot.name.split('/').slice(-1)[0];
            }
        }

        this.swapDest = dest;
        this.swapControlsOpen = true;
    }

    public showAddControls() {

    }

    openSlotBlade(slotName: string) {
        const resourceId = this._relativeSlotsArm.filter(s => s.properties.name === slotName).map(s => s.id)[0];

        if (resourceId) {
            this._portalService.openBlade({
                detailBlade: 'AppsOverviewBlade',
                detailBladeInputs: { id: resourceId }
            },
                'deployment-slots'
            );
        }
    }
}