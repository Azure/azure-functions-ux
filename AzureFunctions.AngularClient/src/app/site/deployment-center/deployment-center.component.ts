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
import { AiService } from '../../shared/services/ai.service';
import { Component, Input, OnInit } from '@angular/core';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
	selector: 'app-deployment-center',
	templateUrl: './deployment-center.component.html',
	styleUrls: ['./deployment-center.component.scss']
})
export class DeploymentCenterComponent implements OnInit, OnDestroy {
	public resourceIdStream: Subject<string>;
	private _resourceId: string;
	@Input()
	set resourceId(resourceId: string) {
		this._resourceId = resourceId;
		this.resourceIdStream.next(resourceId);
	}

	get resourceId() {
		return this._resourceId;
	}

	public hasWritePermissions = true;

	private _ngUnsubscribe = new Subject();
	private _siteConfigObject: ArmObj<SiteConfig>;
	private _busyManager: BusyStateScopeManager;

	public showFTPDashboard = false;
	public showWebDeployDashboard = false;

	constructor(
		private _aiService: AiService,
		private _authZService: AuthzService,
		private _cacheService: CacheService,
		broadcastService: BroadcastService
	) {
		this._busyManager = new BusyStateScopeManager(broadcastService, 'site-tabs');

		this.resourceIdStream = new Subject<string>();
		this.resourceIdStream
			.takeUntil(this._ngUnsubscribe)
			.distinctUntilChanged()
			.switchMap(resourceId => {
				this._busyManager.setBusy();
				this.resourceId = resourceId;
				this._siteConfigObject = null;
				return Observable.zip(
					this._cacheService.getArm(`${resourceId}/config/web`),
					this._authZService.hasPermission(resourceId, [AuthzService.writeScope]),
					this._authZService.hasReadOnlyLock(resourceId),
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
				error => {
					this._siteConfigObject = null;
					this._aiService.trackEvent('/errors/deployment-center', error);
					this._busyManager.clearBusy();
				}
			);
		broadcastService.getEvents<string>(BroadcastEvent.ReloadDeploymentCenter).subscribe(this.refreshedSCMType.bind(this));
	}

	refreshedSCMType() {
		this._cacheService.clearArmIdCachePrefix(`${this.resourceId}/config/web`);
		this.resourceIdStream.next(this.resourceId);
	}

	get DeploymentSetUpComplete() {
		return this._siteConfigObject && this._siteConfigObject.properties.scmType !== 'None';
	}

	get ScmType() {
		return this._siteConfigObject && this._siteConfigObject.properties.scmType;
	}

	ngOnDestroy() {
		this._ngUnsubscribe.next();
	}

	ngOnInit() {}
}
