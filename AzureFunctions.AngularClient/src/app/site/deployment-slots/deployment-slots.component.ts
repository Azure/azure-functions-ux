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
import { TreeViewInfo, SiteData } from './../../tree-view/models/tree-view-info';

import { AuthzService } from '../../shared/services/authz.service';
import { ArmSiteDescriptor } from '../../shared/resourceDescriptors';
import { FunctionAppContext } from 'app/shared/function-app-context';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { SiteService } from 'app/shared/services/site.service';
import { PortalService } from 'app/shared/services/portal.service';
import { ArmObj } from 'app/shared/models/arm/arm-obj';
import { Site } from 'app/shared/models/arm/site';
import { SiteConfig } from 'app/shared/models/arm/site-config';
import { PortalResources } from 'app/shared/models/portal-resources';
import { FeatureComponent } from 'app/shared/components/feature-component';
import { CustomFormGroup } from './../../controls/click-to-edit/click-to-edit.component';

@Component({
    selector: 'slots',
    templateUrl: './deployment-slots.component.html',
    styleUrls: ['./deployment-slots.component.scss']
})
export class DeploymentSlotsComponent extends FeatureComponent<TreeViewInfo<SiteData>> implements OnDestroy {
    public Resources = PortalResources;

    public mainForm: FormGroup;
    public slotContext: FunctionAppContext;
    public siteContext: FunctionAppContext;
    public hasWriteAccess: boolean;
    public hasSwapAccess: boolean;

    public swapControlsOpen: boolean;
    public swapSrc: string;
    public swapDest: string;

    public dirtyMessage: string;

    private _isSlot: boolean;

    private slotsListArm: ArmObj<Site>[];
    private _siteConfigArm: ArmObj<SiteConfig>;

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
        private _functionAppService: FunctionAppService,
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

                this.slotsListArm = null;
                this._siteConfigArm = null;

                const siteDescriptor = new ArmSiteDescriptor(viewInfo.resourceId);

                const siteResourceId = siteDescriptor.slot ? siteDescriptor.getSiteOnlyResourceId() : null;

                return Observable.zip(
                    this._functionAppService.getAppContext(siteDescriptor.getTrimmedResourceId()),
                    siteResourceId ? this._functionAppService.getAppContext(siteResourceId) : Observable.of(null),
                    this._siteService.getSiteConfig(siteDescriptor.getTrimmedResourceId())
                );
            })
            .switchMap(r => {
                this.slotContext = r[0];
                this.siteContext = r[1] || r[0];

                this._isSlot = this._functionAppService.isSlot(this.slotContext);

                if (r[2].isSuccessful) {
                    this._siteConfigArm = r[2].result;
                }

                return this._functionAppService.getSlotsList(this.siteContext);
            })
            .switchMap(slotsList => {
                if (slotsList.isSuccessful) {
                    this.slotsListArm = slotsList.result.filter(s => s != this.slotContext.site);
                    if (this._isSlot) {
                        this.slotsListArm.unshift(this.siteContext.site);
                    }
                }

                this._setupForm();

                if (this._swapMode) {
                    this._swapMode = false;
                    this.showSwapControls();
                }

                this.clearBusyEarly();

                return Observable.zip(
                    this._authZService.hasPermission(this.slotContext.site.id, [AuthzService.writeScope]),
                    this._authZService.hasPermission(this.slotContext.site.id, [AuthzService.actionScope]),
                    this._authZService.hasReadOnlyLock(this.slotContext.site.id),
                    (p, s, l) => ({
                        hasWritePermission: p,
                        hasSwapPermission: s,
                        hasReadOnlyLock: l
                    }));
            })
            .do(r => {
                this.hasWriteAccess = r.hasWritePermission && !r.hasReadOnlyLock;

                if (this.hasWriteAccess && r.hasSwapPermission) {
                    if (this._isSlot) {
                        this.hasSwapAccess = true;
                    } else {
                        this.hasSwapAccess = this.slotsListArm && this.slotsListArm.length > 0;
                    }
                }
            });
    }

    private _setupForm() {
        if (!!this.slotContext.site && !!this.slotsListArm && !!this._siteConfigArm) {
            this.mainForm = this._fb.group({});

            const groupArray = this._fb.array([]);

            const routingRules = this._siteConfigArm.properties.routingRules;

            this.slotsListArm.forEach(siteArm => {
                const resourceId = siteArm.id;
                const name = siteArm.name.split('/')[1] || 'production';
                const routingRule = routingRules.filter(r => r.name === name)[0];
                const pct = routingRule ? routingRule.reroutePercentage : 0;

                const group = this._fb.group({
                    resourceId: [{ value: resourceId, disabled: false }],
                    name: [{ value: name, disabled: false }],
                    pct: [{ value: pct, disabled: false }],
                }) as CustomFormGroup;

                groupArray.push(group);
            })

            this.mainForm.setControl('routingRules', groupArray);
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
        this.swapSrc = null;
        this.swapDest = null;

        dest = dest || this.slotContext.site.properties.targetSwapSlot;
        if (!dest) {
            if (this.slotsListArm && this.slotsListArm.length > 0) {
                dest = this.slotsListArm[0].name;
            }
        }

        this.swapSrc = this.slotContext.site.name;
        this.swapDest = dest;
        this.swapControlsOpen = true;
    }

    public showAddControls() {

    }

    openSlotBlade(resourceId: string) {
        this._portalService.openBlade({
            detailBlade: 'AppsOverviewBlade',
            detailBladeInputs: { id: resourceId }
        },
            'deployment-slots'
        );
    }
}