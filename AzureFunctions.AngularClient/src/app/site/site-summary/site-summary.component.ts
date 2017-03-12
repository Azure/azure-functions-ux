import { Subscription } from './../../shared/models/subscription';
import { AvailabilityStates } from './../../shared/models/constants';
import { Availability } from './../site-notifications/notifications';
import { SiteConfig } from './../../shared/models/arm/site-config';
import { AiService } from './../../shared/services/ai.service';
import { AppsNode } from './../../tree-view/apps-node';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Response } from '@angular/http';
import { ArmObj } from './../../shared/models/arm/arm-obj';
import { AppNode } from './../../tree-view/app-node';
import { TreeViewInfo } from './../../tree-view/models/tree-view-info';
import { ArmService } from './../../shared/services/arm.service';
import { GlobalStateService } from './../../shared/services/global-state.service';
import { Component, OnInit, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import {Observable, Subject, Subscription as RxSubscription} from 'rxjs/Rx';
import {CacheService} from '../../shared/services/cache.service';
import {AuthzService} from '../../shared/services/authz.service';
import {SiteDescriptor} from '../../shared/resourceDescriptors';
import {PublishingCredentials} from '../../shared/models/publishing-credentials';
import {SiteEnabledFeaturesComponent} from '../site-enabled-features/site-enabled-features.component';
import {SiteNotificationsComponent} from '../site-notifications/site-notifications.component';
import {Site} from '../../shared/models/arm/site';

interface DataModel
{
    publishCreds : PublishingCredentials,
    config : ArmObj<SiteConfig>,
    hasWritePermission : boolean,
    hasReadOnlyLock : boolean,
    availability : ArmObj<Availability>,
}

@Component({
    selector: 'site-summary',
    templateUrl: './site-summary.component.html',
    styleUrls: ['./site-summary.component.scss'],
    inputs: ['viewInfoInput']
})

export class SiteSummaryComponent implements OnDestroy {

    public subscriptionId : string;
    public subscriptionName : string;
    public resourceGroup : string;
    public location : string;
    public state : string;
    public stateIcon : string;
    public availabilityState : string;
    public availabilityMesg : string;
    public availabilityIcon : string;
    public plan : string;
    public url : string;
    public publishingUserName : string;
    public scmType : string;
    public site : ArmObj<Site>;
    public hasWriteAccess : boolean;

    public publishProfileLink : SafeUrl;


    @Output() openTabEvent = new Subject<string>();

    private _viewInfoStream : Subject<TreeViewInfo>;
    private _viewInfo : TreeViewInfo;
    private _subsSub : RxSubscription;
    private _subs : Subscription[];

    constructor(
        private _cacheService : CacheService,
        authZService : AuthzService,
        private _armService : ArmService,
        private _globalStateService : GlobalStateService,
        private _aiService : AiService,
        private _domSanitizer : DomSanitizer) {

        this._subsSub = this._armService.subscriptions.subscribe(subscriptions =>{
            this._subs = subscriptions;
        });

        this._viewInfoStream = new Subject<TreeViewInfo>();
        this._viewInfoStream
            .distinctUntilChanged()
            .switchMap(viewInfo =>{
                this._viewInfo = viewInfo;
                this._globalStateService.setBusyState();
                return this._cacheService.getArm(viewInfo.resourceId);
            })
            .switchMap(r =>{
                let site : ArmObj<Site> = r.json();
                this.site = site;
                let descriptor = new SiteDescriptor(site.id);

                this.subscriptionId = descriptor.subscription;
                this.subscriptionName = this._subs.find(s => s.subscriptionId === this.subscriptionId).displayName;

                this.resourceGroup = descriptor.resourceGroup;

                let serverFarm = site.properties.serverFarmId.split('/')[8];
                this.plan = `${serverFarm} (${site.properties.sku})`;
                this.url = `https://${site.properties.defaultHostName}`;

                this.location = site.location;
                this.state = site.properties.state;
                this.stateIcon = this.state === "Running" ? "images/success.svg" : "images/stopped.svg";

                this.availabilityState = null;
                this.availabilityMesg = "Loading...";
                this.availabilityIcon = null;

                this.publishingUserName = "Loading...";
                this.scmType = null;
                this.publishProfileLink = null;

                let configId = `${site.id}/config/web`;
                let availabilityId = `${site.id}/providers/Microsoft.ResourceHealth/availabilityStatuses/current`;

                return Observable.zip<DataModel>(
                    authZService.hasPermission(site.id, [AuthzService.writeScope]),
                    authZService.hasReadOnlyLock(site.id),
                    this._cacheService.getArm(configId),
                    this._cacheService.getArm(availabilityId, false, ArmService.availabilityApiVersion),
                    (p, l, c, a) => ({ 
                        hasWritePermission : p,
                        hasReadOnlyLock : l,
                        config : c.json(),
                        availability : a.json()
                    }))
            })
            .flatMap(res =>{
                this.hasWriteAccess = res.hasWritePermission && !res.hasReadOnlyLock;
                this._setAvailabilityState(res.availability.properties.availabilityState);

                if(this.hasWriteAccess){
                    return this._cacheService.postArm(`${this.site.id}/config/publishingcredentials/list`)
                    .map(r =>{
                        res.publishCreds = r.json()
                        return res;
                    })
               }

                return Observable.of(res);
            })
            .subscribe(res =>{
                this._globalStateService.clearBusyState();
                this.scmType = res.config.properties.scmType;

                if(this.hasWriteAccess){
                    this.publishingUserName = res.publishCreds.properties.publishingUserName;
                }
                else{
                    this.publishingUserName = "No access";
                }
            });
    }

    set viewInfoInput(viewInfo : TreeViewInfo){
        if(!viewInfo){
            return;
        }

        this._viewInfoStream.next(viewInfo);
    }

    ngOnDestroy() {
        this._subsSub.unsubscribe();
    }

    openComponent(component : string){
        this.openTabEvent.next(component);
    }

    toggleState(){
        if(!this.hasWriteAccess){
            return;
        }

        if(this.site.properties.state === "Running"){
            let confirmResult = confirm(`Are you sure you would like to stop ${this.site.name}`);
            if(confirmResult){
                this._stopOrStartSite(true);
            }
        }
        else{
            this._stopOrStartSite(false);
        }
    }

    downloadPublishProfile(event : any){
        if(!this.hasWriteAccess){
            return;
        }

        this._armService.post(`${this.site.id}/publishxml`, null)
        .subscribe(response =>{
            let publishXml = response.text();

            // http://stackoverflow.com/questions/24501358/how-to-set-a-header-for-a-http-get-request-and-trigger-file-download/24523253#24523253
            let windowUrl = window.URL || (<any>window).webkitURL;
            let blob = new Blob([publishXml], { type: 'application/octet-stream' });

            // http://stackoverflow.com/questions/37432609/how-to-avoid-adding-prefix-unsafe-to-link-by-angular2
            let blobUrl = windowUrl.createObjectURL(blob);
            this.publishProfileLink = this._domSanitizer.bypassSecurityTrustUrl(blobUrl);

            setTimeout(() =>{
                if(event.srcElement.nextElementSibling.id === "hidden-publish-profile-link"){
                    event.srcElement.nextElementSibling.click();
                }

                windowUrl.revokeObjectURL(blobUrl);
                this.publishProfileLink = null;
            },
            10);
        });
    }

    resetPublishCredentials(){
        if(!this.hasWriteAccess){
            return;
        }

        let confirmResult = confirm(`Are you sure you want to reset your publish profile? Profiles downloaded previously will become invalid.`);
        if(confirmResult){
            this._globalStateService.setBusyState();
            this._armService.post(`${this.site.id}/newpassword`, null)
            .subscribe(response =>{
                this._globalStateService.clearBusyState();
            });
        }
    }

    delete(){
        if(!this.hasWriteAccess){
            return;
        }

        let confirmResult = confirm(`Deleting web app '${this.site.name}' will delete the web app and all of its deployment slots. Are you sure you want to delete '${this.site.name}'?`);
        if(confirmResult){
            let site = this.site;
            let appNode = <AppNode>this._viewInfo.node;

            this._globalStateService.setBusyState();
            this._armService.delete(`${site.id}`, null)
            .subscribe(response =>{
                this._globalStateService.clearBusyState();
                (<AppNode>appNode).remove();
            });
        }
    }

    restart(){
        if(!this.hasWriteAccess){
            return;
        }

        let site = this.site;

        let confirmResult = confirm(`Are you sure you would like to restart ${site.name}`);
        if(confirmResult){
            this._globalStateService.setBusyState();
            this._armService.post(`${site.id}/restart`, null)
            .subscribe((site) =>{
                this._globalStateService.clearBusyState();
            });
        }
    }

    private _setAvailabilityState(availabilityState : string){
        this.availabilityState = availabilityState.toLowerCase();
        switch (this.availabilityState) {
            case AvailabilityStates.unknown:
                this.availabilityIcon = "";
                this.availabilityMesg = "Not applicable";
                break;
            case AvailabilityStates.unavailable:
                this.availabilityIcon = "images/error.svg";
                this.availabilityMesg = "Not available"
                break;
            case AvailabilityStates.available:
                this.availabilityIcon = "images/success.svg";
                this.availabilityMesg = "Available";
                break;
            case AvailabilityStates.userinitiated:
                this.availabilityIcon = "images/info.svg";
                this.availabilityMesg = "Not available";
                break;
        }
    }

    private _stopOrStartSite(stop : boolean){
        // Save reference to current values in case user clicks away
        let site = this.site;
        let appNode = <AppNode>this._viewInfo.node;

        let action = stop ? "stop" : "start";

        this._globalStateService.setBusyState();
        this._armService.post(`${site.id}/${action}`, null)
        .switchMap(()=>{
            return this._cacheService.getArm(`${site.id}`, true);
        })
        .subscribe(r =>{
            let refreshedSite : ArmObj<Site> = r.json();

            // Current site could have changed if user clicked away
            if(refreshedSite.id === this.site.id){
                this.site = refreshedSite;
            }

            this._globalStateService.clearBusyState();

            appNode.refresh();
        })
    }
}