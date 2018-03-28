import { SiteConfig } from '../../shared/models/arm/site-config';
import { ArmObj } from '../../shared/models/arm/arm-obj';
import { CacheService } from '../../shared/services/cache.service';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/zip';
import { BusyStateScopeManager } from './../../busy-state/busy-state-scope-manager';
import { AuthzService } from '../../shared/services/authz.service';
import { Component, Input } from '@angular/core';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { TreeViewInfo, SiteData } from 'app/tree-view/models/tree-view-info';
import { LogCategories } from 'app/shared/models/constants';
import { LogService } from 'app/shared/services/log.service';

@Component({
    selector: 'app-deployment-center',
    templateUrl: './deployment-center.component.html',
    styleUrls: ['./deployment-center.component.scss']
})
export class DeploymentCenterComponent implements OnDestroy {
    public resourceIdStream: Subject<string>;
    public resourceId: string;
    public viewInfoStream = new Subject<TreeViewInfo<SiteData>>();
    public viewInfo: TreeViewInfo<SiteData>;
    @Input()
    set viewInfoInput(viewInfo: TreeViewInfo<SiteData>) {
        this.viewInfo = viewInfo;
        this.viewInfoStream.next(viewInfo);
    }

    public hasWritePermissions = true;

    private _ngUnsubscribe = new Subject();
    private _siteConfigObject: ArmObj<SiteConfig>;
    private _busyManager: BusyStateScopeManager;

    public showFTPDashboard = false;
    public showWebDeployDashboard = false;

    constructor(
        private _authZService: AuthzService,
        private _cacheService: CacheService,
        private _logService: LogService,
        broadcastService: BroadcastService
    ) {
        this._busyManager = new BusyStateScopeManager(broadcastService, 'site-tabs');

        this.viewInfoStream
            .takeUntil(this._ngUnsubscribe)
            .switchMap(view => {
                this._busyManager.setBusy();
                this.resourceId = view.resourceId;
                this._siteConfigObject = null;
                return Observable.zip(
                    this._cacheService.getArm(`${this.resourceId}/config/web`),
                    this._authZService.hasPermission(this.resourceId, [AuthzService.writeScope]),
                    this._authZService.hasReadOnlyLock(this.resourceId),
                    (sc, wp, rl) => ({
                        siteConfig: sc.json(),
                        writePermission: wp,
                        readOnlyLock: rl
                    })
                );
            })
            .subscribe(
                r => {
                    this._siteConfigObject = r.siteConfig;
                    this.hasWritePermissions = r.writePermission && !r.readOnlyLock;
                    this._busyManager.clearBusy();
                },
                err => {
                    this._siteConfigObject = null;
                    this._logService.error(LogCategories.cicd, '/load-deployment-center', err);
                    this._busyManager.clearBusy();
                }
            );
        broadcastService
            .getEvents<string>(BroadcastEvent.ReloadDeploymentCenter)
            .takeUntil(this._ngUnsubscribe)
            .subscribe(this.refreshedSCMType.bind(this));
    }

    refreshedSCMType() {
        this._cacheService.clearArmIdCachePrefix(`${this.resourceId}/config/web`);
        this.viewInfoStream.next(this.viewInfo);
    }

    get kuduDeploymentSetup() {
        return this._siteConfigObject && this._siteConfigObject.properties.scmType !== 'None' && this.scmType !== 'VSTSRM';
    }

    get scmType() {
        return this._siteConfigObject && this._siteConfigObject.properties.scmType;
    }

    ngOnDestroy() {
        this._ngUnsubscribe.next();
    }
}
