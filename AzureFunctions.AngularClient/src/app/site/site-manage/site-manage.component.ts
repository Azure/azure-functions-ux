import { GlobalStateService } from './../../shared/services/global-state.service';
import { CacheService } from './../../shared/services/cache.service';
import { TreeViewInfo } from './../../tree-view/models/tree-view-info';
import { AiService } from './../../shared/services/ai.service';
import { Message } from './../../shared/models/portal';
import { DisableableBladeFeature, DisableableFeature, DisableInfo } from './../../feature-group/feature-item';
import { FeatureGroup } from './../../feature-group/feature-group';
import {Component, OnInit, EventEmitter, Input, Output} from '@angular/core';
import {Observable, Subject} from 'rxjs/Rx';
import {ArmService} from '../../shared/services/arm.service';
import {AuthzService} from '../../shared/services/authz.service';
import {PortalService} from '../../shared/services/portal.service';
import {Site} from '../../shared/models/arm/site';
import {ArmObj} from '../../shared/models/arm/arm-obj';
import {SiteDescriptor} from '../../shared/resourceDescriptors';
import {PopOverComponent} from '../../pop-over/pop-over.component';
import {FeatureGroupComponent} from '../../feature-group/feature-group.component';
import {FeatureItem, TabFeature, BladeFeature, OpenBrowserWindowFeature} from '../../feature-group/feature-item';
import {WebsiteId} from '../../shared/models/portal';

@Component({
    selector: 'site-manage',
    templateUrl: './site-manage.component.html',
    styleUrls: ['./site-manage.component.scss'],
    inputs: ["viewInfoInput"]
})

export class SiteManageComponent {
    public groups1 : FeatureGroup[]; 
    public groups2 : FeatureGroup[];
    public groups3 : FeatureGroup[];

    public searchTerm = "";
    private _viewInfoStream = new Subject<TreeViewInfo>();
    private _viewInfo : TreeViewInfo;
    private _descriptor : SiteDescriptor;

    private _hasSiteWritePermissionStream = new Subject<DisableInfo>();
    private _hasPlanReadPermissionStream = new Subject<DisableInfo>();

    private _dynamicDisableInfo : DisableInfo;

    @Output() openTabEvent = new Subject<string>();

    set viewInfoInput(viewInfo : TreeViewInfo){
        this._viewInfoStream.next(viewInfo);
    }

    constructor(
        private _authZService : AuthzService,
        private _portalService : PortalService,
        private _aiService : AiService,
        private _cacheService : CacheService,
        private _globalStateService : GlobalStateService){

        this._viewInfoStream
        .switchMap(viewInfo =>{
            this._viewInfo = viewInfo;
            this._globalStateService.setBusyState();
            return this._cacheService.getArm(viewInfo.resourceId);
        })
        .switchMap(r =>{
            this._globalStateService.clearBusyState();
            let traceKey = this._viewInfo.data.siteTraceKey;
            this._aiService.stopTrace("/sites/features-tab-ready", traceKey);

            let site : ArmObj<Site> = r.json();
            this._portalService.closeBlades();
            this._descriptor = new SiteDescriptor(site.id);

            this._dynamicDisableInfo = {
                enabled : site.properties.sku !== "Dynamic",
                disableMessage : "This feature is not supported for apps on a Consumption plan"
            }

            this._disposeGroups();

            this._initCol1Groups(site);
            this._initCol2Groups(site);
            this._initCol3Groups(site);

            let loadObs : Observable<any>[] = [];

            return Observable.zip(
                this._authZService.hasPermission(site.id,  [AuthzService.writeScope]),
                this._authZService.hasPermission(site.properties.serverFarmId, [AuthzService.readScope]),
                this._authZService.hasReadOnlyLock(site.id),
                (s, p, l) => ({ hasSiteWritePermissions : s, hasPlanReadPermissions : p, hasReadOnlyLock : l})
            )
        })
        .do(null, e =>{
            this._aiService.trackException(e, "site-manage");
        })
        .retry()
        .subscribe(r =>{
            let hasSiteWritePermissions = r.hasSiteWritePermissions && !r.hasReadOnlyLock;
            let siteWriteDisabledMessage = "";

            if(!r.hasSiteWritePermissions){
                siteWriteDisabledMessage = "You must have write permissions on the current app in order to use this feature";
            }
            else if(r.hasReadOnlyLock){
                siteWriteDisabledMessage = "This feature is disabled because the app has a ReadOnly lock on it.";
            }

            this._hasSiteWritePermissionStream.next({
                enabled : r.hasSiteWritePermissions && !r.hasReadOnlyLock,
                disableMessage : siteWriteDisabledMessage
            });

            this._hasPlanReadPermissionStream.next({
                enabled : r.hasPlanReadPermissions,
                disableMessage : "You must have read permissions on the associated App Service plan in order to use this feature"
            })
        });
    }

    ngOnDestroy() {
        this._portalService.closeBlades();
        this._disposeGroups();
    }

    private _disposeGroups(){
        if(this.groups1){
            this.groups1.forEach(group =>{
                this._disposeGroup(group);
            })
        }

        if(this.groups2){
            this.groups2.forEach(group =>{
                this._disposeGroup(group);
            })
        }

        if(this.groups3){
            this.groups3.forEach(group =>{
                this._disposeGroup(group);
            })
        }
    }

    private _disposeGroup(group : FeatureGroup){
        group.features.forEach(feature =>{
            feature.dispose();
        })
    }

    private _initCol1Groups(site : ArmObj<Site>){
        let codeDeployFeatures = [
            new DisableableBladeFeature(
                "Deployment source",
                "continuous deployment source github bitbucket dropbox onedrive vsts visual studio code vso",
                "Deployment source info",
                "images/deployment-source.svg",
                {
                    detailBlade : "ContinuousDeploymentListBlade",
                    detailBladeInputs : {
                        id : this._descriptor.resourceId,
                        ResourceId : this._descriptor.resourceId
                    }
                },
                this._portalService,
                this._hasSiteWritePermissionStream),

            new BladeFeature(
                "Deployment credentials",
                "deployment credentials",
                "Info",
                "images/deployment-credentials.svg",
                {
                    detailBlade : "FtpCredentials",
                    detailBladeInputs :{
                        WebsiteId : this._descriptor.getWebsiteId()
                    }
                },
                this._portalService)            
        ];

        let developmentToolFeatures = [
            new DisableableBladeFeature(
                "Console",
                "console debug",
                "Info",
                "images/console.svg",
                {
                    detailBlade : "ConsoleBlade",
                    detailBladeInputs : {
                        resourceUri : site.id
                    }
                },
                this._portalService,
                this._hasSiteWritePermissionStream),
           
            new OpenKuduFeature(site, this._hasSiteWritePermissionStream),

            new OpenEditorFeature(site, this._hasSiteWritePermissionStream), 

            new OpenResourceExplorer(site),

            new DisableableBladeFeature(
                "Extensions",
                "Extensions",
                "Info",
                "images/extensions.svg",
                {
                    detailBlade : "SiteExtensionsListBlade",
                    detailBladeInputs : {
                        WebsiteId : this._descriptor.getWebsiteId()
                    }
                },
                this._portalService,
                this._hasSiteWritePermissionStream,
                this._dynamicDisableInfo),
        ]

        let generalFeatures = [
            new BladeFeature(
                "Application settings",
                "application settings connection strings java php .net",
                "Info",
                "images/application-settings.svg",
                {
                    detailBlade : "WebsiteConfigSiteSettings",
                    detailBladeInputs : {
                        resourceUri : site.id,
                    }
                },
                this._portalService),   

            new BladeFeature(
                "Properties",
                "properties",
                "Info",
                "images/properties.svg",
                {
                    detailBlade : "PropertySheetBlade",
                    detailBladeInputs : {
                        resourceId : this._descriptor.resourceId,
                    }
                },
                this._portalService), 

            // new DisableableBladeFeature(
            //     "Web jobs",
            //     "web jobs",
            //     "Info",
            //     "images/webjobs.svg",
            //     {
            //         detailBlade : "webjobsNewBlade",
            //         detailBladeInputs : {
            //             resourceUri : site.id
            //         }
            //     },
            //     this._portalService,
            //     this._hasSiteWritePermissionStream,                
            //     this._dynamicDisableInfo),

            new DisableableBladeFeature(
                "Backups",
                "backups",
                "Info",
                "images/backups.svg",
                {
                    detailBlade : "Backup",
                    detailBladeInputs : {
                        resourceUri : site.id
                    }
                },
                this._portalService,
                this._hasSiteWritePermissionStream,                
                this._dynamicDisableInfo),

            new BladeFeature(
                "All settings",
                "all settings support request scale",
                "Info",
                "images/webapp.svg",
                {
                    detailBlade : "WebsiteBlade",
                    detailBladeInputs : {
                        id : site.id
                    }
                },
                this._portalService)
        ]

        this.groups1 = [
            new FeatureGroup("General settings", generalFeatures),
            new FeatureGroup("Code deployment", codeDeployFeatures),
            new FeatureGroup("Development tools", developmentToolFeatures)
        ];
    }

    private _initCol2Groups(site : ArmObj<Site>){
        
        let networkFeatures = [
            new DisableableBladeFeature(
                "Networking",
                "networking",
                "Info",
                "images/networking.svg",
                {
                    detailBlade : "NetworkSummaryBlade",
                    detailBladeInputs : {
                        resourceUri : site.id
                    }
                },
                this._portalService,
                this._hasSiteWritePermissionStream,                
                this._dynamicDisableInfo),

            new DisableableBladeFeature(
                "SSL",
                "ssl",
                "Info",
                "images/ssl.svg",
                {
                    detailBlade : "CertificatesBlade",
                    detailBladeInputs : { resourceUri : site.id }
                },
                this._portalService,
                this._hasSiteWritePermissionStream),

            new DisableableBladeFeature(
                "Custom domains",
                "custom domains",
                "Info",
                "images/custom-domains.svg",
                {                
                    detailBlade : "CustomDomainsAndSSL",
                    detailBladeInputs : {
                        resourceUri : this._descriptor.resourceId,
                        BuyDomainSelected : false
                    }
                },
                this._portalService,
                this._hasSiteWritePermissionStream),

            new DisableableBladeFeature(
                "Authentication / Authorization",
                "authentication authorization aad google facebook microsoft",
                "Info",
                "images/authentication.svg",
                {
                    detailBlade : "AppAuth",
                    detailBladeInputs : { resourceUri : site.id }
                },
                this._portalService,
                this._hasSiteWritePermissionStream),

            new DisableableBladeFeature(
                "Push notifications",
                "push",
                "Info",
                "images/push.svg",
                {
                    detailBlade : "PushRegistrationBlade",
                    detailBladeInputs : { resourceUri : this._descriptor.resourceId }
                },
                this._portalService,
                this._hasSiteWritePermissionStream),
        ]

        let monitoringFeatures = [
            new BladeFeature(
                "Diagnostic logs",
                "diagnostic logs",
                "Info",
                "images/diagnostic-logs.svg",
                {
                    detailBlade : "WebsiteLogsBlade",
                    detailBladeInputs : { WebsiteId : this._descriptor.getWebsiteId() }
                },
                this._portalService),

            new DisableableBladeFeature(
                "Log streaming",
                "log streaming",
                "Info",
                "images/log-stream.svg",
                {
                    detailBlade : "LogStreamBlade",
                    detailBladeInputs : { resourceUri : site.id }
                },
                this._portalService,
                this._hasSiteWritePermissionStream),

            new DisableableBladeFeature(
                "Process Explorer",
                "process explorer",
                "Info",
                "images/process-explorer.svg",
                {
                    detailBlade : "ProcExpNewBlade",
                    detailBladeInputs : { resourceUri : site.id }
                },
                this._portalService,
                this._hasSiteWritePermissionStream),            

            new BladeFeature(
                "Security scanning",
                "security scanning tinfoil",
                "Info",
                "images/tinfoil-flat-21px.png",
                {
                    detailBlade : "TinfoilSecurityBlade",
                    detailBladeInputs : { WebsiteId : this._descriptor.getWebsiteId() }
                },
                this._portalService),
        ]

        this.groups2 = [
            new FeatureGroup("Networking", networkFeatures),
            new FeatureGroup("Monitoring", monitoringFeatures)];
    }

    private _initCol3Groups(site : ArmObj<Site>){
        let apiManagementFeatures = [
            new BladeFeature(
                "CORS",
                "cors api",
                "Info",
                "images/cors.svg",
                {
                    detailBlade : "ApiCors",
                    detailBladeInputs : { resourceUri : site.id }
                },
                this._portalService),

            new BladeFeature(
                "API Definition",
                "api definition swagger",
                "Info",
                "images/api-definition.svg",
                {
                    detailBlade : "ApiDefinition",
                    detailBladeInputs : { resourceUri : site.id }
                },
                this._portalService),
        ]

        let appServicePlanFeatures = [
            new DisableableBladeFeature(
                "App Service plan",
                "app service plan scale",
                "Info",
                "images/app-service-plan.svg",
                {
                    detailBlade : "WebHostingPlanBlade",
                    detailBladeInputs : { id : site.properties.serverFarmId }
                },
                this._portalService,
                this._hasPlanReadPermissionStream),

            new DisableableBladeFeature(
                "Quotas",
                "quotas",
                "Info",
                "images/quotas.svg",
                {
                    detailBlade : "QuotasBlade",
                    detailBladeInputs : {
                        resourceUri : site.id
                    }
                },
                this._portalService,
                null,
                this._dynamicDisableInfo),
        ]

        let resourceManagementFeatures = [
            new BladeFeature(
                "Activity log",
                "activity log events",
                "Info",
                "images/activity-log.svg",
                {
                    detailBlade : "EventsBrowseBlade",
                    detailBladeInputs : {
                        id : site.id
                    },
                    extension : "Microsoft_Azure_Monitoring"
                },
                this._portalService
            ),

            new BladeFeature(
                "Access control (IAM)",
                "access control rbac",
                "Info",
                "images/access-control.svg",
                {
                    detailBlade : "UserAssignmentsV2Blade",
                    detailBladeInputs : {
                        scope : site.id
                    },
                    extension : "Microsoft_Azure_AD"
                },
                this._portalService
            ),            

            new BladeFeature(
                "Tags",
                "tags",
                "Info",
                "images/tags.svg",
                {
                    detailBlade : "ResourceTagsListBlade",
                    detailBladeInputs : {
                        resourceId : site.id
                    },
                    extension : "HubsExtension"
                },
                this._portalService
            ),        

            new BladeFeature(
                "Locks",
                "locks",
                "Info",
                "images/locks.svg",
                {
                    detailBlade : "LocksBlade",
                    detailBladeInputs : {
                        resourceId : site.id
                    },
                    extension : "HubsExtension"
                },
                this._portalService),

            // new NotImplementedFeature("Clone app", "clone app", "Info"),  // TODO: ellhamai - Need to implent

            new BladeFeature(
                "Automation script",
                "export template arm azure resource manager api",
                "Info",
                "images/automation-script.svg",
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

            // new NotImplementedFeature(  // TODO: ellhamai - Need to implement
            //     "New support request",
            //     "support request",
            //     "Info"),
        ]

        this.groups3 = [
            new FeatureGroup("APIs", apiManagementFeatures),
            new FeatureGroup("App Service Plan", appServicePlanFeatures),
            new FeatureGroup("Resource management", resourceManagementFeatures)];
    }

    openTab(tabName : string){
        this.openTabEvent.next(tabName);
    }
}

export class OpenKuduFeature extends DisableableFeature{
        constructor(
            private _site : ArmObj<Site>,
            disableInfoStream : Subject<DisableInfo>){
        
        super(
            "Advanced tools",
            "kudu advanced tools",
            "Info",
            "images/advanced-tools.svg",
            disableInfoStream);
    }

    click(){
        let scmHostName = this._site.properties.hostNameSslStates.find(h => h.hostType === 1).name;
        window.open(`https://${scmHostName}`);
    }
}

export class OpenEditorFeature extends DisableableFeature{
        constructor(private _site : ArmObj<Site>, disabledInfoStream : Subject<DisableInfo>){

        super(
            "App service editor",
            "app service editor visual studio online",
            "Info",
            "images/appsvc-editor.svg",
            disabledInfoStream);
    }

    click(){
        let scmHostName = this._site.properties.hostNameSslStates.find(h => h.hostType === 1).name;
        window.open(`https://${scmHostName}/dev`);
    }
}

export class OpenResourceExplorer extends FeatureItem{
        constructor(private _site : ArmObj<Site>){
        super("Explore the API", "resource explorer", "Info", "images/resource-explorer.svg");
    }

    click(){
        window.open(`https://resources.azure.com${this._site.id}`);
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
