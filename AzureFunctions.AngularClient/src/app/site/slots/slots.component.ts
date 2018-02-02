import { BroadcastService } from './../../shared/services/broadcast.service';
import { BusyStateScopeManager } from './../../busy-state/busy-state-scope-manager';
import { Component, OnDestroy, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
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
import { ArmObj } from 'app/shared/models/arm/arm-obj';
import { Site } from 'app/shared/models/arm/site';

@Component({
    selector: 'slots',
    templateUrl: './slots.component.html',
    styleUrls: ['./slots.component.scss']
})
export class SlotsComponent implements OnDestroy {
    public slotContext: FunctionAppContext;
    public siteContext: FunctionAppContext;
    public hasWriteAccess: boolean;
    public hasSwapAccess: boolean;

    public swapControlsOpen: boolean;
    public swapSrc: string;
    public swapDest: string;

    public dirtyMessage: string;

    private _viewInfoStream: Subject<TreeViewInfo<SiteData>>;
    private _viewInfoSubscription: RxSubscription;
    private _isSlot: boolean;

    private slotsListArm: ArmObj<Site>[];

    private _busyManager: BusyStateScopeManager;

    @Input() set viewInfoInput(viewInfo: TreeViewInfo<SiteData>) {
        this._viewInfoStream.next(viewInfo);
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
        authZService: AuthzService,
        public ts: TranslateService,
        private _functionAppService: FunctionAppService,
        private _broadcastService: BroadcastService) {

        this._busyManager = new BusyStateScopeManager(this._broadcastService, 'site-tabs');

        this._viewInfoStream = new Subject<TreeViewInfo<SiteData>>();
        this._viewInfoSubscription = this._viewInfoStream
            .switchMap(viewInfo => {
                this._busyManager.setBusy();

                this.hasWriteAccess = false;
                this.hasSwapAccess = false;

                this.swapControlsOpen = false;
                this.swapSrc = null;
                this.swapDest = null;

                this.slotsListArm = null;

                const siteDescriptor = new ArmSiteDescriptor(viewInfo.resourceId);

                const siteResourceId = siteDescriptor.slot ? siteDescriptor.getSiteOnlyResourceId() : null;
                
                return Observable.zip(
                    this._functionAppService.getAppContext(siteDescriptor.getTrimmedResourceId()),
                    siteResourceId ? this._functionAppService.getAppContext(siteResourceId) : Observable.of(null)
                );
            })
            .switchMap(r => {
                this.slotContext = r[0];
                this.siteContext = r[1] || r[0];

                this._isSlot = _functionAppService.isSlot(this.slotContext);

                return Observable.zip(
                    authZService.hasPermission(this.slotContext.site.id, [AuthzService.writeScope]),
                    authZService.hasPermission(this.slotContext.site.id, [AuthzService.actionScope]),
                    authZService.hasReadOnlyLock(this.slotContext.site.id),
                    this._functionAppService.getSlotsList(this.siteContext),
                    (p, s, l, slots) => ({
                        hasWritePermission: p,
                        hasSwapPermission: s,
                        hasReadOnlyLock: l,
                        slotsList: slots
                    }));
            })
            .do(null, e => {
                this._busyManager.clearBusy();
            })
            .subscribe(r => {
                this._busyManager.clearBusy();
                this.hasWriteAccess = r.hasWritePermission && !r.hasReadOnlyLock;

                if (r.slotsList.isSuccessful) {
                    this.slotsListArm = r.slotsList.result.filter(s => s != this.slotContext.site);
                    if (this._isSlot) {
                        this.slotsListArm.unshift(this.siteContext.site);
                    }
                }

                if (this.hasWriteAccess && r.hasSwapPermission) {
                    if (this._isSlot) {
                        this.hasSwapAccess = true;
                    } else {
                        this.hasSwapAccess = this.slotsListArm && this.slotsListArm.length > 0;
                    }
                }

                if (this._swapMode) {
                    this._swapMode = false;
                    this.showSwapControls();
                }
            });
    }

    ngOnDestroy(): void {
        if (this._viewInfoSubscription) {
            this._viewInfoSubscription.unsubscribe();
            this._viewInfoSubscription = null;
        }
        this._busyManager.clearBusy();
        this._broadcastService.clearDirtyState('slot-swap');
        this._broadcastService.clearDirtyState('slot-add');
    }

    public showSwapControls(dest?:string) {
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
}