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
import {FeatureGroup} from '../../feature-group/feature-group';
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
        let devFeatures = [
            new TabFeature(
                "Deployment source",
                "continuous deployment source github bitbucket dropbox onedrive vsts visual studio code vso",
                "Deployment source info",
                "deployment-source",
                this.openTabEvent),

            new BladeFeature(
                "Performance Testing",
                "vso visual studio performance testing",
                "Info",
                {
                   detailBlade : "CreateLoadTestBlade",
                   detailBladeInputs : {
                       websiteUri : site.id
                   },
                   extension : "AzureTfsExtension"
                },
                this._portalService),

            new ResourceUriBladeFeature(
                "Console",
                "console debug",
                "Info",
                site.id,
                "ConsoleBlade",
                this._portalService),

            new BladeFeature(
                "Data Connections",
                "data connection string",
                "Info",
                {
                    detailBlade : "DataConnectionList",
                    detailBladeInputs : {
                        webSite : {
                            webSiteResourceUri : site.id,
                            webSiteLocation : site.location
                        }
                    },
                    extension : "Microsoft_Azure_MobileServices"
                },
                this._portalService),

            new ResourceUriBladeFeature(
                "CORS",
                "cors api",
                "Info",
                site.id,
                "ApiCors",
                this._portalService),

            new BladeFeature(
                "Zend Z-Ray",
                "php zend z-ray",
                "Info",
                {
                    detailBlade : "ZendZRayBlade",
                    detailBladeInputs : {
                        WebsiteId : this._descriptor.getWebsiteId()
                    }
                },
                this._portalService),

            new ResourceUriBladeFeature(
                "API Definition",
                "api definition swagger",
                "Info",
                site.id,
                "ApiDefinition",
                this._portalService),

            new ResourceUriBladeFeature(
                "Web Jobs",
                "web jobs",
                "Info",
                site.id,
                "webjobsNewBlade",
                this._portalService),

            new ResourceUriBladeFeature(
                "Visual Studio Online",
                "visual studio online code",
                "Info",
                site.id,
                "MonacoBlade",
                this._portalService)
        ]

        let devGroup = new FeatureGroup("Development", devFeatures);

        let mobileFeatures = [
            new BladeFeature(
                "Easy tables",
                "easy tables",
                "Info",
                {
                    detailBlade : "TableListBlade",
                    detailBladeInputs :{
                        websiteId : site.id
                    },
                    extension : "Microsoft_Azure_MobileServices"
                },
                this._portalService),

            new BladeFeature(
                "Easy APIs",
                "easy apis",
                "Info",
                {
                    detailBlade : "ApiListBlade",
                    detailBladeInputs :{
                        websiteId : site.id
                    },
                    extension : "Microsoft_Azure_MobileServices"
                },
                this._portalService),

            new FeatureItem("Push notifications", "push notifications", "Info")
        ]

        let mobileGroup = new FeatureGroup("Mobile", mobileFeatures);

        this.groups1 = [devGroup, mobileGroup];
    }

    private _initCol2Groups(site : ArmObj<Site>){
        let networkFeatures = [
            new BladeFeature(
                "Custom domains & SSL",
                "custom domains ssl",
                "Info",
                {
                    detailBlade : "WebsiteConfigSSLSettings",
                    detailBladeInputs : {
                        WebsiteId : this._descriptor.getWebsiteId(),
                        BuyDomainSelected : false
                    }
                },
                this._portalService),

            new ResourceUriBladeFeature(
                "Networking",
                "virtual network",
                "Info",
                site.id,
                "NetworkSummaryBlade",
                this._portalService),

            new ResourceUriBladeFeature(
                "Authentication / Authorization",
                "authentication authorization aad google facebook microsoft",
                "Info",
                site.id,
                "AppAuth",
                this._portalService),

            new BladeFeature(
                "Traffic manager",
                "traffic manager",
                "Info",
                {
                    detailBlade : "NoticeBlade",
                    detailBladeInputs : {
                        info: {
                            RedirectionUrl: "#create/Microsoft.TrafficManagerProfile-ARM",
                            ComingSoonTitle: "Traffic Manager",
                            ComingSoonDescription: "Monitor your applications so you can keep your critical workloads up and running, with automatic fail-over in case a service goes down. Deep integration between Azure App Service and Azure Traffic Manager is coming soon. If you want to get started right away, you can now create Traffic Manager profiles in the Azure portal.",
                            ComingSoonBladeHeader: "Coming soon",
                            WebsiteId: this._descriptor.getWebsiteId()
                        }
                    }
                },
                this._portalService),

            new BladeFeature(
                "Traffic routing",
                "traffic routing test production",
                "Info",
                {
                    detailBlade : "WebsiteRoutingRulesBlade",
                    detailBladeInputs : {
                        WebsiteId : this._descriptor.getWebsiteId()
                    }
                },
                this._portalService)
        ]
        
        let networkGroup = new FeatureGroup("Networking", networkFeatures);

        let aspFeatures = [
            new RBACBladeFeature(
                "App Service plan",
                "app service plan scale",
                "Info",
                site.properties.serverFarmId,
                ["./read"],
                "You do not have read permissions for the associated plan",
                this._rbacService,
                {
                    detailBlade : "AppServicePlanMenuBlade",
                    detailBladeInputs : {
                        resourceId : site.properties.serverFarmId
                    }
                },
                this._portalService),

            new RBACFeature(
                "Scale up",
                "app service plan scale",
                "Info",
                site.properties.serverFarmId,
                ["./write"],
                "You do not have write permissions to perform a scale operation on the associated plan",
                this._rbacService),

            new RBACBladeFeature(
                "Scale out",
                "app service plan scale",
                "Info",
                site.properties.serverFarmId,
                ["./write"],
                "You do not have write permissions to perform a scale operation on the associated plan",
                this._rbacService,
                {
                    detailBlade : "AppServiceScaleSettingBlade",
                    detailBladeInputs : {
                        WebHostingPlanId: site.properties.serverFarmId,
                        resourceId: site.properties.serverFarmId,
                        apiVersion: "2015-08-01",
                        options: null
                    }
                },
                this._portalService),

            new RBACFeature(
                "Change plan",
                "app service plan",
                "Info",
                site.id,
                ["./write"],
                "You do not have write permissions to change the plan associated with this app",
                this._rbacService)
        ]
        
        let aspGroup = new FeatureGroup("App Service Plan", aspFeatures);

        this.groups2 = [networkGroup, aspGroup];
    }

    private _initCol3Groups(site : ArmObj<Site>){

        let observeFeatures = [
            new BladeFeature(
                "Log streaming",
                "log streaming",
                "Info",
                {
                    detailBlade : "LogStreamBlade",
                    detailBladeInputs : {
                        WebsiteId : this._descriptor.getWebsiteId()
                    }
                },
                this._portalService),

            new ResourceUriBladeFeature(
                "Process Explorer",
                "process explorer",
                "Info",
                site.id,
                "ProcExpNewBlade",
                this._portalService),

            new BladeFeature(
                "Audit logs",
                "audit logs",
                "Info",
                {
                    detailBlade : "AzureDiagnosticsBladeWithParameter",
                    detailBladeInputs : {
                        defaultFilter : {
                            resourceId : site.id
                        },
                        options : {}
                    },
                    extension : "Microsoft_Azure_Insights"
                },
                this._portalService),

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

            new FeatureItem("Alerts", "alerts", "Info")
        ]

        let observeGroup = new FeatureGroup("Observe", observeFeatures);

        let generalFeatures = [
            new ResourceUriBladeFeature(
                "Application settings",
                "application settings connection strings java php .net",
                "Info",
                site.id,
                "WebsiteConfigSiteSettings",
                this._portalService),

            new ResourceUriBladeFeature(
                "Backups",
                "backups",
                "Info",
                site.id,
                "Backup",
                this._portalService),

            new FeatureItem("Clone app", "clone app", "Info"),

            new BladeFeature(
                "Tinfoil Security",
                "tinfoil security",
                "Info",
                {
                    detailBlade : "TinfoilSecurityBlade",
                    detailBladeInputs : {
                        WebsiteId : this._descriptor.getWebsiteId()
                    }
                },
                this._portalService)
        ]

        let generalGroup = new FeatureGroup("General", generalFeatures);

        let resourceFeatures = [
            new BladeFeature(
                "Tags",
                "tags",
                "Info",
                {
                    detailBlade : "ResourceTagsListBlade",
                    detailBladeInputs : {
                        resourceId : site.id
                    },
                    extension : "HubsExtension"
                },
                this._portalService),

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

            new BladeFeature(
                "Users",
                "users rbac role base authorization",
                "Info",
                {
                    detailBlade : "UserAssignmentsBlade",
                    detailBladeInputs : {
                        scope : site.id
                    },
                    extension : "Microsoft_Azure_AD"
                },
                this._portalService),

            new BladeFeature(
                "Export template",
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
                this._portalService)
        ]

        let resourceGroup = new FeatureGroup("Resource Management", resourceFeatures);

        this.groups3 = [observeGroup, generalGroup, resourceGroup];
    }

    openTab(tabName : string){
        this.openTabEvent.next(tabName);
    }
}