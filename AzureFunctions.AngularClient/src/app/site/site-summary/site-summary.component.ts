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
import {ArmObj} from '../../shared/models/arm/arm-obj';

@Component({
    selector: 'site-summary',
    templateUrl: './site-summary.component.html',
    styleUrls: ['../site-dashboard/site-dashboard.component.scss'],
    inputs: ['siteInput']
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

    @Output() openTabEvent = new Subject<string>();

    private _siteSubject : Subject<ArmObj<Site>>;

    constructor(cacheService : CacheService, rbacService : RBACService) {
        this._siteSubject = new Subject<ArmObj<Site>>();
        this._siteSubject
            .distinctUntilChanged()
            .switchMap(site =>{
                this.site = site;
                let descriptor = new SiteDescriptor(site.id);

                this.subscription = descriptor.subscription;
                this.resourceGroup = descriptor.resourceGroup;

                let serverFarm = site.properties.serverFarmId.split('/')[8];
                this.plan = `${serverFarm} (${site.properties.sku})`;
                this.url = `http://${site.properties.hostNames[0]}`;

                this.location = site.location;
                this.state = site.properties.state;

                this.publishingUserName = "Loading...";
                this.scmType = null;

                let configId = `${site.id}/config/web`;

                return Observable.zip(
                    rbacService.hasPermission(site.id, [rbacService.writeScope]),
                    cacheService.getArmResource(configId),
                    (hasPermission, config) =>({ hasPermission : hasPermission, config : config}))
            })
            .flatMap(res =>{
                if(res.hasPermission){
                    let credId = `${this.site.id}/config/publishingcredentials/list`;
                    return cacheService.postArmResource(credId)
                        .map(creds =>{
                            return {
                                creds : creds,
                                config : res.config,
                                hasPermission : res.hasPermission
                            }
                        })
                }

                return Observable.of(res);
            })
            .subscribe((res : {creds : PublishingCredentials, config : ArmObj<SiteConfig>, hasPermission : boolean}) =>{
                this.hasWriteAccess = res.hasPermission;

                if(res.hasPermission){
                    this.publishingUserName = res.creds.properties.publishingUserName;
                }
                else{
                    this.publishingUserName = "No access";
                }

                this.scmType = res.config.properties.scmType;
            });
    }

    set siteInput(site : ArmObj<Site>){
        if(!site){
            return;
        }

        this._siteSubject.next(site);
    }

    openComponent(component : string){
        this.openTabEvent.next(component);
    }
}