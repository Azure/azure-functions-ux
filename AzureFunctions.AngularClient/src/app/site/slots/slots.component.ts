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
    public context: FunctionAppContext;
    public hasWriteAccess: boolean;
    public hasSwapAccess: boolean;

    public dirtyMessage: string;

    private _viewInfoStream: Subject<TreeViewInfo<SiteData>>;
    private _viewInfoSubscription: RxSubscription;
    private _isSlot: boolean;

    private _slotsListArm: ArmObj<Site>[];

    private _busyManager: BusyStateScopeManager;

    @Input() set viewInfoInput(viewInfo: TreeViewInfo<SiteData>) {
        this._viewInfoStream.next(viewInfo);
    }

    @Input() set swapTarget(target: string) {
        this.showSwapControls(target);
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
                this._slotsListArm = null;

                const siteDescriptor = new ArmSiteDescriptor(viewInfo.resourceId);
                return this._functionAppService.getAppContext(siteDescriptor.getTrimmedResourceId());
            })
            .switchMap(context => {
                this.context = context;
                this._isSlot = _functionAppService.isSlot(context);

                return Observable.zip(
                    authZService.hasPermission(context.site.id, [AuthzService.writeScope]),
                    authZService.hasPermission(context.site.id, [AuthzService.actionScope]),
                    authZService.hasReadOnlyLock(context.site.id),
                    this._functionAppService.getSlotsList(context),
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
                    this._slotsListArm = r.slotsList.result;
                }

                if (this.hasWriteAccess && r.hasSwapPermission) {
                    if (this._isSlot) {
                        this.hasSwapAccess = true;
                    } else {
                        this.hasSwapAccess = this._slotsListArm && this._slotsListArm.length > 0;
                    }
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

    }

    public showAddControls() {

    }
}