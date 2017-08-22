import { AiService } from '../../../../shared/services/ai.service';
import { AuthzService } from '../../../../shared/services/authz.service';
import { SiteTabComponent } from '../../../../site/site-dashboard/site-tab/site-tab.component';
import { CacheService } from '../../../../shared/services/cache.service';
import { PortalService } from '../../../../shared/services/portal.service';
import { BusyStateScopeManager } from '../../../../busy-state/busy-state-scope-manager';
import { Observable, Subject } from 'rxjs/Rx';
import { DeploymentData } from '../../../Models/deploymentData';
import { BusyStateComponent } from '../../../../busy-state/busy-state.component';
import { SimpleChanges } from '@angular/core/src/metadata/lifecycle_hooks';
import { Component, Input, OnChanges } from '@angular/core';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import { Headers } from '@angular/http';

@Component({
    selector: 'app-kudu-git-mercurial-dashboard',
    templateUrl: './kudu-git-mercurial-dashboard.component.html',
    styleUrls: ['./kudu-git-mercurial-dashboard.component.scss']
})
export class KuduGitMercurialDashboardComponent implements OnChanges {
    @Input() resourceId: string;

    _busyState: BusyStateComponent;
    public viewInfoStream: Subject<string>;
    _viewInfoSubscription: RxSubscription;
    _busyStateScopeManager: BusyStateScopeManager;
    _writePermission = true;
    _readOnlyLock = false;
    public hasWritePermissions = true;
    public deploymentObject: DeploymentData;

    public oAuthToken = '';
    constructor(
        _portalService: PortalService,
        private _cacheService: CacheService,
        private _aiService: AiService,
        private _authZService: AuthzService,
        siteTabsComponent: SiteTabComponent
    ) {
        this._busyState = siteTabsComponent.busyState;
        this._busyStateScopeManager = this._busyState.getScopeManager();

        this.viewInfoStream = new Subject<string>();
        this._viewInfoSubscription = this.viewInfoStream
            .distinctUntilChanged()
            .switchMap(resourceId => {
                this._busyStateScopeManager.setBusy();
                return Observable.zip(
                    this._cacheService.getArm(resourceId),
                    this._cacheService.getArm(`${resourceId}/config/web`),
                    this._cacheService.postArm(
                        `${resourceId}/config/metadata/list`
                    ),
                    this._cacheService.postArm(
                        `${resourceId}/config/publishingcredentials/list`
                    ),
                    this._cacheService.getArm(
                        `${resourceId}/sourcecontrols/web`
                    ),
                    this._cacheService.getArm(`${resourceId}/deployments`),
                    this._authZService.hasPermission(resourceId, [
                        AuthzService.writeScope
                    ]),
                    this._authZService.hasReadOnlyLock(resourceId),
                    (
                        site,
                        siteConfig,
                        metadata,
                        pubCreds,
                        sourceControl,
                        deployments,
                        writePerm: boolean,
                        readLock: boolean
                    ) => ({
                        site: site.json(),
                        siteConfig: siteConfig.json(),
                        metadata: metadata.json(),
                        pubCreds: pubCreds.json(),
                        sourceControl: sourceControl.json(),
                        deployments: deployments.json(),
                        writePermission: writePerm,
                        readOnlyLock: readLock
                    })
                );
            })
            .do(null, error => {
                this.deploymentObject = null;
                this._aiService.trackEvent('/errors/deployment-center', error);
                this._busyStateScopeManager.clearBusy();
            })
            .retry()
            .switchMap(r => {
                this.deploymentObject = {
                    site: r.site,
                    siteConfig: r.siteConfig,
                    siteMetadata: r.metadata,
                    sourceControls: r.sourceControl,
                    publishingCredentials: r.pubCreds,
                    deployments: r.deployments
                };
                console.log(r.metadata);
                this._writePermission = r.writePermission;
                this._readOnlyLock = r.readOnlyLock;
                this.hasWritePermissions = r.writePermission && !r.readOnlyLock;
                this._busyStateScopeManager.clearBusy();

                if (
                    this.deploymentObject.siteConfig.properties.scmType ===
                    'BitbucketGit'
                ) {
                    return Observable.zip(
                        Observable.of(this.deploymentObject),
                        this._cacheService.post(
                            '/api/auth/bitbucket/refresh',
                            false,
                            null,
                            {
                                refresh_token: this.deploymentObject
                                    .siteMetadata.properties[
                                    'OAuthRefreshToken'
                                ]
                            }
                        ),
                        (q, w) => ({
                            dO: q,
                            refresh: w.text()
                        })
                    );
                } else {
                    return Observable.zip(
                        Observable.of(this.deploymentObject),
                        Observable.of(null),
                        (q, w) => ({
                            dO: q,
                            refresh: w.text()
                        })
                    );
                }
            })
            .switchMap(r => {
                const aToken = r.refresh;
                return this._cacheService.get(
                    r.dO.siteMetadata.properties['RepoApiUri'],
                    false,
                    this._getHeaders(aToken)
                );
            })
            .subscribe(r => {
                console.log(r.json());
            });
    }
    private _getHeaders(token: string): Headers {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'application/json');
        headers.append('Authorization', `Bearer ${token}`);
        // headers.append('Referer', 'https://localhost:42300');

        return headers;
    }
    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['resourceId']) {
            this.viewInfoStream.next(this.resourceId);
        }
    }
}
