import { FeatureGroup } from './../../feature-group/feature-group';
import { OpenBrowserWindowFeature } from './../../feature-group/feature-item';
import {Component, OnInit, EventEmitter, Input, Output} from '@angular/core';
import {Observable, Subject} from 'rxjs/Rx';
import {ArmService} from '../../shared/services/arm.service';
import {RBACService} from '../../shared/services/rbac.service';
import {PortalService} from '../../shared/services/portal.service';
import {Site} from '../../shared/models/arm/site';
import {ArmObj} from '../../shared/models/arm/arm-obj';
import {SiteDescriptor} from '../../shared/resourceDescriptors';
import {PopOverComponent} from '../../pop-over/pop-over.component';
import {FeatureGroupComponent} from '../../feature-group/feature-group.component';
import {FeatureItem, RBACFeature, RBACBladeFeature, TabFeature, BladeFeature, ResourceUriBladeFeature} from '../../feature-group/feature-item';
import {WebsiteId} from '../../shared/models/portal';

@Component({
    selector: 'site-manage',
    templateUrl: './site-manage.component.html',
    styleUrls: ['../site-dashboard/site-dashboard.component.scss'],
    inputs: ["siteInput"]
})

export class SiteManageComponent {
    public groups1 : FeatureGroup[]; 
    public groups2 : FeatureGroup[];
    public groups3 : FeatureGroup[];

    public searchTerm = "";
    private _siteSub = new Subject<ArmObj<Site>>();
    private _descriptor : SiteDescriptor;

    @Output() openTabEvent = new Subject<string>();

    set siteInput(site : ArmObj<Site>){
        this._siteSub.next(site);
    }

    constructor(private _rbacService : RBACService, private _portalService : PortalService){
        this._siteSub
        .distinctUntilChanged()
        .switchMap(site =>{
            this._portalService.closeBlades();

            this._descriptor = new SiteDescriptor(site.id);

            this._initCol1Groups(site);
            this._initCol2Groups(site);
            this._initCol3Groups(site);

            let loadObs : Observable<any>[] = [];
            this._getLoadObservables(this.groups1, loadObs);
            this._getLoadObservables(this.groups2, loadObs);
            this._getLoadObservables(this.groups3, loadObs);

            return Observable.zip.apply(null, loadObs);
        })
        .subscribe(results =>{
            
        });
    }

    ngOnDestroy() {
        this._portalService.closeBlades();
    }

    private _getLoadObservables(groups : FeatureGroup[], observables : Observable<any>[]){
        groups.forEach(group =>{
            group.features.forEach(feature =>{
                observables.push(feature.load());
            })
        })
    }

    private _initCol1Groups(site : ArmObj<Site>){
        let codeDeployFeatures = [
            new BladeFeature(
                "Deployment source",
                "continuous deployment source github bitbucket dropbox onedrive vsts visual studio code vso",
                "Deployment source info",
                {
                        detailBlade : "ContinuousDeploymentListBlade",
                        detailBladeInputs : {
                            id : this._descriptor.resourceId,
                            ResourceId : this._descriptor.resourceId
                        }
                },
                this._portalService),

            new BladeFeature(
                "Deployment credentials",
                "deployment credentials",
                "Info",
                {
                    detailBlade : "FtpCredentials",
                    detailBladeInputs :{
                        WebsiteId : this._descriptor.getWebsiteId()
                    }
                },
                this._portalService)            
        ];

        let developmentToolFeatures = [
            new ResourceUriBladeFeature(
                "Console",
                "console debug",
                "Info",
                site.id,
                "ConsoleBlade",
                this._portalService), 
           
            new OpenKuduFeature(site),

            new OpenEditorFeature(site), 

            new OpenResourceExplorer(),
        ]

        let generalFeatures = [
            new ResourceUriBladeFeature(
                "Application settings",
                "application settings connection strings java php .net",
                "Info",
                site.id,
                "WebsiteConfigSiteSettings",
                this._portalService),   

            new BladeFeature(
                "Properties",
                "properties",
                "Info",
                {
                    detailBlade : "PropertySheetBlade",
                    detailBladeInputs : {
                        resourceId : this._descriptor.resourceId,
                    }
                },
                this._portalService),         
        ]

        this.groups1 = [
            new FeatureGroup("Code deployment", codeDeployFeatures),
            new FeatureGroup("Development tools", developmentToolFeatures),
            new FeatureGroup("General", generalFeatures)];
    }

    private _initCol2Groups(site : ArmObj<Site>){
        
        let networkFeatures = [
            new BladeFeature(
                "SSL",
                "ssl",
                "Info",
                {
                    detailBlade : "CertificatesBlade",
                    detailBladeInputs : {
                        resourceUri : this._descriptor.resourceId,
                    }
                },
                this._portalService),

            new BladeFeature(
                "Custom domains",
                "custom domains",
                "Info",
                {                
                    detailBlade : "CustomDomainsAndSSL",
                    detailBladeInputs : {
                        resourceUri : this._descriptor.resourceId,
                        BuyDomainSelected : false
                    }
                },
                this._portalService),

            new ResourceUriBladeFeature(
                "Authentication / Authorization",
                "authentication authorization aad google facebook microsoft",
                "Info",
                site.id,
                "AppAuth",
                this._portalService),

            new BladeFeature(
                "Push notifications",
                "push",
                "Info",
                {
                    detailBlade : "PushRegistrationBlade",
                    detailBladeInputs : {
                        resourceUri : this._descriptor.resourceId,
                    }
                },
                this._portalService),
        ]

        let monitoringFeatures = [
            new BladeFeature(
                "Diagnostic logs",
                "diagnostic logs",
                "Info",
                {
                    detailBlade : "WebsiteLogsBlade",
                    detailBladeInputs : {
                        WebsiteId : this._descriptor.getWebsiteId()
                    }
                },
                this._portalService),

            new ResourceUriBladeFeature(
                "Log streaming",
                "log streaming",
                "Info",
                site.id,
                "LogStreamBlade",
                this._portalService),

            new ResourceUriBladeFeature(
                "Process Explorer",
                "process explorer",
                "Info",
                site.id,
                "ProcExpNewBlade",
                this._portalService),            

            new BladeFeature(
                "Security scanning",
                "security scanning tinfoil",
                "Info",
                {
                    detailBlade : "TinfoilSecurityBlade",
                    detailBladeInputs : {
                        WebsiteId : this._descriptor.getWebsiteId(),
                    }
                },
                this._portalService),
        ]

        this.groups2 = [
            new FeatureGroup("Networking", networkFeatures),
            new FeatureGroup("Monitoring", monitoringFeatures)];
    }

    private _initCol3Groups(site : ArmObj<Site>){
        let apiManagementFeatures = [
            new ResourceUriBladeFeature(
                "CORS",
                "cors api",
                "Info",
                site.id,
                "ApiCors",
                this._portalService),

            new ResourceUriBladeFeature(
                "API Definition",
                "api definition swagger",
                "Info",
                site.id,
                "ApiDefinition",
                this._portalService),            
        ]

        let appServicePlanFeatures = [
            new RBACBladeFeature(
                "App Service plan",
                "app service plan scale",
                "Info",
                site.properties.serverFarmId,
                ["./read"],
                "You do not have read permissions for the associated plan",
                this._rbacService,
                {
                    detailBlade : "WebHostingPlanBlade",
                    detailBladeInputs : {
                        id : site.properties.serverFarmId
                    }
                },
                this._portalService),

            new ResourceUriBladeFeature(
                "Quotas",
                "quotas",
                "Info",
                site.id,
                "QuotasBlade",
                this._portalService),
        ]

        let resourceManagementFeatures = [
            new BladeFeature(
                "Locks",
                "locks",
                "Info",
                {
                    detailBlade : "LocksBlade",
                    detailBladeInputs : {
                        resourceId : site.id
                    },
                    extension : "HubsExtension"
                },
                this._portalService),

            new NotImplementedFeature("Clone app", "clone app", "Info"),  // TODO: ellhamai - Need to implent

            new BladeFeature(
                "Automation script",
                "export template arm azure resource manager api",
                "Info",
                {
                    detailBlade : "TemplateViewerBlade",
                    detailBladeInputs : {
                        options: {
                            resourceGroup : `/subscriptions/${this._descriptor.subscription}/resourcegroups/${this._descriptor.resourceGroup}`,
                            telemetryId : "Microsoft.Web/sites"
                        },
                        stepOutput: null
                    },
                    extension : "HubsExtension"
                },
                this._portalService),

            new NotImplementedFeature(  // TODO: ellhamai - Need to implement
                "New support request",
                "support request",
                "Info"),
        ]

        this.groups3 = [
            new FeatureGroup("API management", apiManagementFeatures),
            new FeatureGroup("App Service Plan", appServicePlanFeatures),
            new FeatureGroup("Resource management", resourceManagementFeatures)];
    }

    openTab(tabName : string){
        this.openTabEvent.next(tabName);
    }
}

export class OpenKuduFeature extends FeatureItem{
        constructor(private _site : ArmObj<Site>){
        super("Advanced tools", "kudu advanced tools", "Info");
    }

    click(){
        let scmHostName = this._site.properties.hostNameSslStates.find(h => h.hostType === 1).name;
        window.open(`https://${scmHostName}`);
    }
}

export class OpenEditorFeature extends FeatureItem{
        constructor(private _site : ArmObj<Site>){

        super("App service editor", "app service editor visual studio online", "Info");
    }

    click(){
        let scmHostName = this._site.properties.hostNameSslStates.find(h => h.hostType === 1).name;
        window.open(`https://${scmHostName}/dev`);
    }
}

export class OpenResourceExplorer extends FeatureItem{
        constructor(){
        super("Resource Explorer", "resource explorer", "Info");
    }

    click(){
        window.open("https://resources.azure.com")
    }
}

export class NotImplementedFeature extends FeatureItem{
        constructor(
        title : string,
        keywords : string,
        info : string){

        super(title, keywords, info);
    }

    click(){
        alert("Not implemented");
    }
}