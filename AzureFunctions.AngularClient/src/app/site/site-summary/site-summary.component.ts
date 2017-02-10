import { AppsNode } from './../../tree-view/apps-node';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Response } from '@angular/http';
import { ArmObj } from './../../shared/models/arm/arm-obj';
import { AppNode } from './../../tree-view/app-node';
import { TreeViewInfo } from './../../tree-view/models/tree-view-info';
import { ArmService } from './../../shared/services/arm.service';
import { GlobalStateService } from './../../shared/services/global-state.service';
import {Component, OnInit, EventEmitter, Input, Output} from '@angular/core';
import {Observable, Subject, Subscription as RxSubscription} from 'rxjs/Rx';
import {CacheService} from '../../shared/services/cache.service';
import {RBACService} from '../../shared/services/rbac.service';
import {SiteDescriptor} from '../../shared/resourceDescriptors';
import {PublishingCredentials} from '../../shared/models/publishing-credentials';
import {SiteConfig} from '../../shared/models/arm/site-config';
import {SiteEnabledFeaturesComponent} from '../site-enabled-features/site-enabled-features.component';
import {SiteNotificationsComponent} from '../site-notifications/site-notifications.component';
import {Site} from '../../shared/models/arm/site';

@Component({
    selector: 'site-summary',
    templateUrl: './site-summary.component.html',
    styleUrls: ['../site-dashboard/site-dashboard.component.scss'],
    inputs: ['viewInfoInput']
})

export class SiteSummaryComponent {

    public subscription : string;
    public resourceGroup : string;
    public location : string;
    public state : string;
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

    constructor(
        private _cacheService : CacheService,
        rbacService : RBACService,
        private _armService : ArmService,
        private _globalStateService : GlobalStateService,
        private _domSanitizer : DomSanitizer) {

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

                this.subscription = descriptor.subscription;
                this.resourceGroup = descriptor.resourceGroup;

                let serverFarm = site.properties.serverFarmId.split('/')[8];
                this.plan = `${serverFarm} (${site.properties.sku})`;
                this.url = `https://${site.properties.defaultHostName}`;

                this.location = site.location;
                this.state = site.properties.state;

                this.publishingUserName = "Loading...";
                this.scmType = null;
                this.publishProfileLink = null;

                let configId = `${site.id}/config/web`;

                return Observable.zip(
                    rbacService.hasPermission(site.id, [rbacService.writeScope]),
                    this._cacheService.getArm(configId),
                    (hasPermission, configResponse) =>({ hasPermission : hasPermission, config : configResponse.json() }))
            })
            .flatMap(res =>{
                if(res.hasPermission){
                    return this._cacheService.postArm(`${this.site.id}/config/publishingcredentials/list`)
                    .map(r =>{
                        return {
                            publishCreds : r.json(),
                            config : res.config,
                            hasPermission : res.hasPermission
                        }
                    })
               }

                return Observable.of(res);
            })
            .subscribe((res : {publishCreds : PublishingCredentials, config : ArmObj<SiteConfig>, hasPermission : boolean}) =>{
                this._globalStateService.clearBusyState();
                this.hasWriteAccess = res.hasPermission;
                this.scmType = res.config.properties.scmType;

                if(res.hasPermission){
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

    openComponent(component : string){
        this.openTabEvent.next(component);
    }

    toggleState(){
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

    private _stopOrStartSite(stop : boolean){
        // Save reference to current values in case user clicks away
        let site = this.site;
        let appNode = <AppNode>this._viewInfo.node;

        let action = stop ? "stop" : "start";

        this._globalStateService.setBusyState();
        this._armService.post(`${site.id}/${action}`, null)
        .switchMap(()=>{
            stop ? appNode.handleStoppedSite() : appNode.handleStartedSite();
            return this._cacheService.getArm(`${site.id}`, true);
        })
        .subscribe(r =>{
            let refreshedSite : ArmObj<Site> = r.json();

            // Current site could have changed if user clicked away
            if(refreshedSite.id === this.site.id){
                this.site = refreshedSite;
            }

            this._globalStateService.clearBusyState();
        });

    }
}