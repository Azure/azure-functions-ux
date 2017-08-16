import { SiteTabComponent } from './../site-dashboard/site-tab/site-tab.component';
import { BusyStateComponent } from './../../busy-state/busy-state.component';
import { UserService } from './../../shared/services/user.service';
import { Component, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
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
import { TranslateService } from '@ngx-translate/core';

import { ConfigService } from './../../shared/services/config.service';
import { FunctionApp } from './../../shared/function-app';
import { PortalResources } from './../../shared/models/portal-resources';
import { PortalService } from './../../shared/services/portal.service';
import { Subscription } from './../../shared/models/subscription';
import { AvailabilityStates, KeyCodes } from './../../shared/models/constants';
import { Availability } from './../site-notifications/notifications';
import { AiService } from './../../shared/services/ai.service';
import { ArmObj } from './../../shared/models/arm/arm-obj';
import { AppNode } from './../../tree-view/app-node';
import { TreeViewInfo, SiteData } from './../../tree-view/models/tree-view-info';
import { ArmService } from './../../shared/services/arm.service';
import { GlobalStateService } from './../../shared/services/global-state.service';

import { CacheService } from '../../shared/services/cache.service';
import { AuthzService } from '../../shared/services/authz.service';
import { SiteDescriptor } from '../../shared/resourceDescriptors';
import { Site } from '../../shared/models/arm/site';
import { SlotsService } from '../../shared/services/slots.service';

interface DataModel {
    hasWritePermission: boolean;
    hasSwapPermission: boolean;
    hasReadOnlyLock: boolean;
    slotsList: ArmObj<Site>[];
}

@Component({
    selector: 'site-summary',
    templateUrl: './site-summary.component.html',
    styleUrls: ['./site-summary.component.scss'],
    inputs: ['viewInfoInput']
})

export class SiteSummaryComponent implements OnDestroy {
    public subscriptionId: string;
    public subscriptionName: string;
    public resourceGroup: string;
    public location: string;
    public state: string;
    public stateIcon: string;
    public availabilityState: string;
    public availabilityMesg: string;
    public availabilityIcon: string;
    public plan: string;
    public url: string;
    public scmUrl: string;
    public publishingUserName: string;
    public site: ArmObj<Site>;
    public hasWriteAccess: boolean;
    public publishProfileLink: SafeUrl;
    public isStandalone: boolean;
    public hasSwapAccess: boolean;
    public hideAvailability: boolean;
    public Resources = PortalResources;
    public showDownloadFunctionAppModal = false;

    private _viewInfoStream: Subject<TreeViewInfo<SiteData>>;
    private _viewInfo: TreeViewInfo<SiteData>;
    private _subs: Subscription[];
    private _blobUrl: string;
    private _isSlot: boolean;
    private _busyState: BusyStateComponent;

    constructor(
        private _cacheService: CacheService,
        authZService: AuthzService,
        private _armService: ArmService,
        private _globalStateService: GlobalStateService,
        private _aiService: AiService,
        private _portalService: PortalService,
        private _domSanitizer: DomSanitizer,
        public ts: TranslateService,
        private _configService: ConfigService,
        private _slotService: SlotsService,
        userService: UserService,
        siteTabComponent: SiteTabComponent) {

        this.isStandalone = _configService.isStandalone();
        this._busyState = siteTabComponent.busyState;

        userService.getStartupInfo()
            .first()
            .subscribe(info => {
                this._subs = info.subscriptions;
            });

        this._viewInfoStream = new Subject<TreeViewInfo<SiteData>>();
        this._viewInfoStream
            .switchMap(viewInfo => {
                this._viewInfo = viewInfo;
                this._portalService.sendTimerEvent({
                    timerId: 'TreeViewLoad',
                    timerAction: 'stop'
                });
                this._busyState.setBusyState();
                return this._cacheService.getArm(viewInfo.resourceId);

            })
            .mergeMap(r => {
                const site: ArmObj<Site> = r.json();
                this.site = site;

                const descriptor = new SiteDescriptor(site.id);

                this.subscriptionId = descriptor.subscription;

                if (this.showTryView) {
                    this.subscriptionName = 'Trial Subscription';
                } else {
                    this.subscriptionName = this._subs.find(s => s.subscriptionId === this.subscriptionId).displayName;
                }

                this.resourceGroup = descriptor.resourceGroup;

                this.url = FunctionApp.getMainUrl(this._configService, this.site);
                this.scmUrl = FunctionApp.getScmUrl(this._configService, this.site);

                this.location = site.location;
                this.state = site.properties.state;
                this.stateIcon = this.state === 'Running' ? 'images/success.svg' : 'images/stopped.svg';


                this.availabilityState = null;
                this.availabilityMesg = this.ts.instant(PortalResources.functionMonitor_loading);
                this.availabilityIcon = null;


                this.publishProfileLink = null;


                const serverFarm = site.properties.serverFarmId.split('/')[8];
                this.plan = `${serverFarm} (${site.properties.sku.replace('Dynamic', 'Consumption')})`;
                this._isSlot = SlotsService.isSlot(site.id);



                this._busyState.clearBusyState();
                this._aiService.stopTrace('/timings/site/tab/overview/revealed', this._viewInfo.data.siteTabRevealedTraceKey);

                this.hideAvailability = this._isSlot || site.properties.sku === 'Dynamic';

                // Go ahead and assume write access at this point to unveal everything. This allows things to work when the RBAC API fails and speeds up reveal. In
                // cases where this causes a false positive, the backend will take care of giving a graceful failure.
                this.hasWriteAccess = true;

                this._portalService.sendTimerEvent({
                    timerId: 'ClickToOverviewInputsSet',
                    timerAction: 'stop'
                });
                this._portalService.sendTimerEvent({
                    timerId: 'ClickToOverviewConstructor',
                    timerAction: 'stop'
                });

                return Observable.zip<DataModel>(
                    authZService.hasPermission(site.id, [AuthzService.writeScope]),
                    authZService.hasPermission(site.id, [AuthzService.actionScope]),
                    authZService.hasReadOnlyLock(site.id),
                    this._slotService.getSlotsList(site.id),
                    (p, s, l, slots) => ({
                        hasWritePermission: p,
                        hasSwapPermission: s,
                        hasReadOnlyLock: l,
                        slotsList: slots
                    }));
            })
            .mergeMap(r => {
                this.hasWriteAccess = r.hasWritePermission && !r.hasReadOnlyLock;
                if (!this._isSlot) {
                    this.hasSwapAccess = this.hasWriteAccess && r.hasSwapPermission && r.slotsList.length > 0;
                } else {
                    this.hasSwapAccess = this.hasWriteAccess && r.hasSwapPermission;
                }

                let getAvailabilityObservible = Observable.of(null);
                if (!this.hideAvailability) {
                    const availabilityId = `${this.site.id}/providers/Microsoft.ResourceHealth/availabilityStatuses/current`;
                    getAvailabilityObservible = this._cacheService.getArm(availabilityId, false, ArmService.availabilityApiVersion).catch((e: any) => {
                        // this call fails with 409 is Microsoft.ResourceHealth is not registered
                        if (e.status === 409) {
                            return this._cacheService.postArm(`/subscriptions/${this.subscriptionId}/providers/Microsoft.ResourceHealth/register`)
                                .mergeMap(() => {
                                    return this._cacheService.getArm(availabilityId, false, ArmService.availabilityApiVersion);
                                })
                                .catch(() => {
                                    return Observable.of(null);
                                });
                        }
                        return Observable.of(null);
                    });
                }

                return getAvailabilityObservible;
            })
            .mergeMap(res => {
                const availability: ArmObj<Availability> = res && res.json();
                this._setAvailabilityState(!!availability ? availability.properties.availabilityState : AvailabilityStates.unknown);
                return Observable.of(res);
            })
            .do(null, e => {
                this._busyState.clearBusyState();

                if (!this._globalStateService.showTryView) {
                    this._aiService.trackException(e, 'site-summary');
                }
                else {
                    this._setAvailabilityState(AvailabilityStates.available);
                    this.plan = 'Trial';
                }
            })
            .retry()
            .subscribe((res: any) => {
                if (!res) {
                    return;
                }

                // I'm leaving this one here for now so it measures every call
                this._aiService.stopTrace('/timings/site/tab/overview/full-ready', this._viewInfo.data.siteTabFullReadyTraceKey);
            });
    }

    private get showTryView() {
        return this._globalStateService.showTryView;
    }

    set viewInfoInput(viewInfo: TreeViewInfo<SiteData>) {
        if (!viewInfo) {
            return;
        }

        this._viewInfoStream.next(viewInfo);
    }

    ngOnDestroy() {
        this._cleanupBlob();
    }

    toggleState() {
        if (!this.hasWriteAccess) {
            return;
        }

        if (this.site.properties.state === 'Running') {
            const confirmResult = confirm(this.ts.instant(PortalResources.siteSummary_stopConfirmation).format(this.site.name));
            if (confirmResult) {
                this._stopOrStartSite(true);
            }
        }
        else {
            this._stopOrStartSite(false);
        }
    }

    downloadPublishProfile() {
        if (!this.hasWriteAccess) {
            return;
        }

        this._armService.post(`${this.site.id}/publishxml`, null)
            .subscribe(response => {


                const publishXml = response.text();

                // http://stackoverflow.com/questions/24501358/how-to-set-a-header-for-a-http-get-request-and-trigger-file-download/24523253#24523253
                const windowUrl = window.URL || (<any>window).webkitURL;
                const blob = new Blob([publishXml], { type: 'application/octet-stream' });
                this._cleanupBlob();

                if (window.navigator.msSaveOrOpenBlob) {
                    // Currently, Edge doesn' respect the "download" attribute to name the file from blob
                    // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/7260192/
                    window.navigator.msSaveOrOpenBlob(blob, `${this.site.name}.PublishSettings`);
                } else {
                    // http://stackoverflow.com/questions/37432609/how-to-avoid-adding-prefix-unsafe-to-link-by-angular2
                    this._blobUrl = windowUrl.createObjectURL(blob);
                    this.publishProfileLink = this._domSanitizer.bypassSecurityTrustUrl(this._blobUrl);

                    setTimeout(() => {

                        const hiddenLink = document.getElementById('hidden-publish-profile-link');
                        hiddenLink.click();
                        this.publishProfileLink = null;
                    });
                }
            });
    }

    openDownloadFunctionAppModal() {
        this.showDownloadFunctionAppModal = true;
    }

    hideDownloadFunctionAppModal() {
        this.showDownloadFunctionAppModal = false;
    }

    private _cleanupBlob() {
        const windowUrl = window.URL || (<any>window).webkitURL;
        if (this._blobUrl) {
            windowUrl.revokeObjectURL(this._blobUrl);
            this._blobUrl = null;
        }
    }

    resetPublishCredentials() {
        if (!this.hasWriteAccess) {
            return;
        }

        const confirmResult = confirm(this.ts.instant(PortalResources.siteSummary_resetProfileConfirmation));
        if (confirmResult) {

            let notificationId = null;
            this._busyState.setBusyState();
            this._portalService.startNotification(
                this.ts.instant(PortalResources.siteSummary_resetProfileNotifyTitle),
                this.ts.instant(PortalResources.siteSummary_resetProfileNotifyTitle))
                .first()
                .switchMap(r => {
                    notificationId = r.id;
                    return this._armService.post(`${this.site.id}/newpassword`, null);
                })
                .subscribe(() => {
                    this._busyState.clearBusyState();
                    this._portalService.stopNotification(
                        notificationId,
                        true,
                        this.ts.instant(PortalResources.siteSummary_resetProfileNotifySuccess));
                },
                e => {
                    this._busyState.clearBusyState();
                    this._portalService.stopNotification(
                        notificationId,
                        false,
                        this.ts.instant(PortalResources.siteSummary_resetProfileNotifyFail));

                    this._aiService.trackException(e, '/errors/site-summary/reset-profile');
                });
        }
    }

    restart() {
        if (!this.hasWriteAccess) {
            return;
        }

        const site = this.site;
        let notificationId = null;

        const confirmResult = confirm(this.ts.instant(PortalResources.siteSummary_restartConfirmation).format(this.site.name));
        if (confirmResult) {
            this._busyState.setBusyState();

            this._portalService.startNotification(
                this.ts.instant(PortalResources.siteSummary_restartNotifyTitle).format(site.name),
                this.ts.instant(PortalResources.siteSummary_restartNotifyTitle).format(site.name))
                .first()
                .switchMap(r => {
                    notificationId = r.id;
                    return this._armService.post(`${site.id}/restart`, null);
                })
                .subscribe(() => {
                    this._busyState.clearBusyState();
                    this._portalService.stopNotification(
                        notificationId,
                        true,
                        this.ts.instant(PortalResources.siteSummary_restartNotifySuccess).format(site.name));
                },
                e => {
                    this._busyState.clearBusyState();
                    this._portalService.stopNotification(
                        notificationId,
                        false,
                        this.ts.instant(PortalResources.siteSummary_restartNotifyFail).format(site.name));

                    this._aiService.trackException(e, '/errors/site-summary/restart-app');
                });
        }
    }

    openSubscriptionBlade() {
        // You shouldn't need to reference the menu blade directly, but I think the subscription
        // blade hasn't registered its asset type properly
        this._portalService.openBlade({
            detailBlade: 'ResourceMenuBlade',
            detailBladeInputs: {
                id: `/subscriptions/${this.subscriptionId}`
            },
            extension: 'HubsExtension'
        },
            'site-summary');
    }

    openResourceGroupBlade() {

        this._portalService.openBlade({
            detailBlade: 'ResourceGroupMapBlade',
            detailBladeInputs: {
                id: `/subscriptions/${this.subscriptionId}/resourceGroups/${this.resourceGroup}`
            },
            extension: 'HubsExtension'
        },
            'site-summary');
    }

    openUrl() {
        window.open(this.url);
    }

    openPlanBlade() {
        this._portalService.openBlade({
            detailBlade: 'WebHostingPlanBlade',
            detailBladeInputs: { id: this.site.properties.serverFarmId }
        },
            'site-summary'
        );
    }

    private _setAvailabilityState(availabilityState: string) {
        this.availabilityState = availabilityState.toLowerCase();
        switch (this.availabilityState) {
            case AvailabilityStates.unknown:
                this.availabilityIcon = '';
                this.availabilityMesg = this.ts.instant(PortalResources.notApplicable);
                break;
            case AvailabilityStates.unavailable:
                this.availabilityIcon = 'images/error.svg';
                this.availabilityMesg = this.ts.instant(PortalResources.notAvailable);
                break;
            case AvailabilityStates.available:
                this.availabilityIcon = 'images/success.svg';
                this.availabilityMesg = this.ts.instant(PortalResources.available);
                break;
            case AvailabilityStates.userinitiated:
                this.availabilityIcon = 'images/info.svg';
                this.availabilityMesg = this.ts.instant(PortalResources.notAvailable);
                break;

        }
    }

    private _stopOrStartSite(stop: boolean) {
        // Save reference to current values in case user clicks away
        const site = this.site;
        const appNode = <AppNode>this._viewInfo.node;
        let notificationId = null;

        const action = stop ? 'stop' : 'start';
        const notifyTitle = stop
            ? this.ts.instant(PortalResources.siteSummary_stopNotifyTitle).format(site.name)
            : this.ts.instant(PortalResources.siteSummary_startNotifyTitle).format(site.name);

        this._busyState.setBusyState();

        this._portalService.startNotification(notifyTitle, notifyTitle)
            .first()
            .switchMap(r => {
                notificationId = r.id;
                return this._armService.post(`${site.id}/${action}`, null);
            })
            .switchMap(() => {
                return this._cacheService.getArm(`${site.id}`, true);
            })
            .subscribe(r => {
                const refreshedSite: ArmObj<Site> = r.json();

                // Current site could have changed if user clicked away
                if (refreshedSite.id === this.site.id) {
                    this.site = refreshedSite;
                }

                const notifySuccess = stop
                    ? this.ts.instant(PortalResources.siteSummary_stopNotifySuccess).format(site.name)
                    : this.ts.instant(PortalResources.siteSummary_startNotifySuccess).format(site.name);

                this._portalService.stopNotification(
                    notificationId,
                    true,
                    notifySuccess);

                appNode.refresh();
            },
            e => {
                const notifyFail = stop
                    ? this.ts.instant(PortalResources.siteSummary_stopNotifyFail).format(site.name)
                    : this.ts.instant(PortalResources.siteSummary_startNotifyFail).format(site.name);

                this._busyState.clearBusyState();
                this._portalService.stopNotification(
                    notificationId,
                    false,
                    notifyFail);

                this._aiService.trackException(e, '/errors/site-summary/stop-start');
            });
    }

    openSwapBlade() {
        this._portalService.openBlade({
            detailBlade: 'WebsiteSlotsListBlade',
            detailBladeInputs: { resourceUri: this.site.id }
        },
            'site-summary'
        );
    }

    openDeleteBlade() {
        this._portalService.openBlade({
            detailBlade: 'AppDeleteBlade',
            detailBladeInputs: { resourceUri: this.site.id }
        },
            'site-summary'
        );
    }

    onKeyPress(event: KeyboardEvent, header: string) {
        if (event.keyCode === KeyCodes.enter) {
            switch (header) {
                case 'subscription':
                    this.openSubscriptionBlade();
                    break;
                case 'resourceGroup':
                    this.openResourceGroupBlade();
                    break;
                case 'url':
                    this.openUrl();
                    break;
                case 'appServicePlan':
                    this.openPlanBlade();
                    break;
                default:
                    break;
            }
        }
    }
}
