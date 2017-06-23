import {Component, OnInit, EventEmitter, Input, Output} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/zip';
import { TranslateService } from '@ngx-translate/core';

import { PortalResources } from './../../shared/models/portal-resources';
import { GlobalStateService } from './../../shared/services/global-state.service';
import { CacheService } from './../../shared/services/cache.service';
import { TreeViewInfo } from './../../tree-view/models/tree-view-info';
import { AiService } from './../../shared/services/ai.service';
import { Message } from './../../shared/models/portal';
import { DisableableBladeFeature, DisableableFeature, DisableInfo } from './../../feature-group/feature-item';
import { FeatureGroup } from './../../feature-group/feature-group';
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
        private _globalStateService : GlobalStateService,
        private _translateService : TranslateService){

        this._viewInfoStream
        .switchMap(viewInfo =>{
            this._viewInfo = viewInfo;
            this._globalStateService.setBusyState();
            return this._cacheService.getArm(viewInfo.resourceId);
        })
        .switchMap(r =>{
            this._globalStateService.clearBusyState();
            let traceKey = this._viewInfo.data.siteTraceKey;
            this._aiService.stopTrace("/site/features-tab-ready", traceKey);

            let site : ArmObj<Site> = r.json();
            this._portalService.closeBlades();
            this._descriptor = new SiteDescriptor(site.id);

            this._dynamicDisableInfo = {
                enabled : site.properties.sku !== "Dynamic",
                disableMessage : this._translateService.instant(PortalResources.featureNotSupportedConsumption)
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
                siteWriteDisabledMessage = this._translateService.instant(PortalResources.featureRequiresWritePermissionOnApp);
            }
            else if(r.hasReadOnlyLock){
                siteWriteDisabledMessage = this._translateService.instant(PortalResources.featureDisabledReadOnlyLockOnApp);
            }

            this._hasSiteWritePermissionStream.next({
                enabled : r.hasSiteWritePermissions && !r.hasReadOnlyLock,
                disableMessage : siteWriteDisabledMessage
            });

            this._hasPlanReadPermissionStream.next({
                enabled : r.hasPlanReadPermissions,
                disableMessage : this._translateService.instant(PortalResources.featureDisabledNoPermissionToPlan)
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
                this._translateService.instant(PortalResources.feature_deploymentSourceName),
                this._translateService.instant(PortalResources.continuousDeployment) +
                    " " + this._translateService.instant(PortalResources.source) +
                    " " + this._translateService.instant(PortalResources.options) + 
                    "  github bitbucket dropbox onedrive vsts vso",
                this._translateService.instant(PortalResources.feature_deploymentSourceInfo),
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
                this._translateService.instant(PortalResources.feature_deploymentCredsName),
                this._translateService.instant(PortalResources.feature_deploymentCredsName),
                this._translateService.instant(PortalResources.feature_deploymentCredsInfo),
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
                this._translateService.instant(PortalResources.feature_consoleName),
                this._translateService.instant(PortalResources.feature_consoleName) +
                    " " +this._translateService.instant(PortalResources.debug),
                this._translateService.instant(PortalResources.feature_consoleInfo),
                "images/console.svg",
                {
                    detailBlade : "ConsoleBlade",
                    detailBladeInputs : {
                        resourceUri : site.id
                    }
                },
                this._portalService,
                this._hasSiteWritePermissionStream),

            new OpenKuduFeature(site, this._hasSiteWritePermissionStream, this._translateService),

            new OpenEditorFeature(site, this._hasSiteWritePermissionStream, this._translateService),

            new OpenResourceExplorer(site, this._translateService),

            new DisableableBladeFeature(
                this._translateService.instant(PortalResources.feature_extensionsName),
                this._translateService.instant(PortalResources.feature_extensionsName),
                this._translateService.instant(PortalResources.feature_extensionsInfo),
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
                this._translateService.instant(PortalResources.feature_applicationSettingsName),
                this._translateService.instant(PortalResources.feature_applicationSettingsName) +
                    " " + this._translateService.instant(PortalResources.connectionStrings) +
                    " java php .net",
                this._translateService.instant(PortalResources.feature_applicationSettingsInfo),
                "images/application-settings.svg",
                {
                    detailBlade : "WebsiteConfigSiteSettings",
                    detailBladeInputs : {
                        resourceUri : site.id,
                    }
                },
                this._portalService),

            new BladeFeature(
                this._translateService.instant(PortalResources.feature_propertiesName),
                this._translateService.instant(PortalResources.feature_propertiesName),
                this._translateService.instant(PortalResources.feature_propertiesInfo),
                "images/properties.svg",
                {
                    detailBlade : "PropertySheetBlade",
                    detailBladeInputs : {
                        resourceId : this._descriptor.resourceId,
                    }
                },
                this._portalService),

            new DisableableBladeFeature(
                this._translateService.instant(PortalResources.feature_backupsName),
                this._translateService.instant(PortalResources.feature_backupsName),
                this._translateService.instant(PortalResources.feature_backupsInfo),
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
                this._translateService.instant(PortalResources.feature_allSettingsName),
                this._translateService.instant(PortalResources.feature_allSettingsName) +
                    " " + this._translateService.instant(PortalResources.supportRequest) +
                    " " + this._translateService.instant(PortalResources.scale),
                this._translateService.instant(PortalResources.feature_allSettingsInfo),
                "images/webapp.svg",
                {
                    detailBlade : "AppsOverviewBlade",
                    detailBladeInputs : {
                        id : site.id
                    }
                },
                this._portalService)
        ]

        this.groups1 = [
            new FeatureGroup(this._translateService.instant(PortalResources.feature_generalSettings), generalFeatures),
            new FeatureGroup(this._translateService.instant(PortalResources.feature_codeDeployment), codeDeployFeatures),
            new FeatureGroup(this._translateService.instant(PortalResources.feature_developmentTools), developmentToolFeatures)
        ];
    }

    private _initCol2Groups(site : ArmObj<Site>){

        let networkFeatures = [
            new DisableableBladeFeature(
                this._translateService.instant(PortalResources.feature_networkingName),
                this._translateService.instant(PortalResources.feature_networkingName) +
                    " " + this._translateService.instant(PortalResources.hybridConnections) +
                    " vnet",
                this._translateService.instant(PortalResources.feature_networkingInfo),
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
                this._translateService.instant(PortalResources.feature_sslInfo),
                "images/ssl.svg",
                {
                    detailBlade : "CertificatesBlade",
                    detailBladeInputs : { resourceUri : site.id }
                },
                this._portalService,
                this._hasSiteWritePermissionStream),

            new DisableableBladeFeature(
                this._translateService.instant(PortalResources.feature_customDomainsName),
                this._translateService.instant(PortalResources.feature_customDomainsName),
                this._translateService.instant(PortalResources.feature_customDomainsInfo),
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
                this._translateService.instant(PortalResources.feature_authName),
                this._translateService.instant(PortalResources.authentication) +
                    " " + this._translateService.instant(PortalResources.authorization) +
                    " aad google facebook microsoft",
                this._translateService.instant(PortalResources.feature_authInfo),
                "images/authentication.svg",
                {
                    detailBlade : "AppAuth",
                    detailBladeInputs : { resourceUri : site.id }
                },
                this._portalService,
                this._hasSiteWritePermissionStream),

            new DisableableBladeFeature(
                this._translateService.instant(PortalResources.feature_pushNotificationsName),
                this._translateService.instant(PortalResources.feature_pushNotificationsName),
                this._translateService.instant(PortalResources.feature_pushNotificationsInfo),
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
                this._translateService.instant(PortalResources.feature_diagnosticLogsName),
                this._translateService.instant(PortalResources.feature_diagnosticLogsName),
                this._translateService.instant(PortalResources.feature_diagnosticLogsInfo),
                "images/diagnostic-logs.svg",
                {
                    detailBlade : "WebsiteLogsBlade",
                    detailBladeInputs : { WebsiteId : this._descriptor.getWebsiteId() }
                },
                this._portalService),

            new DisableableBladeFeature(
                this._translateService.instant(PortalResources.feature_logStreamingName),
                this._translateService.instant(PortalResources.feature_logStreamingName),
                this._translateService.instant(PortalResources.feature_logStreamingInfo),
                "images/log-stream.svg",
                {
                    detailBlade : "LogStreamBlade",
                    detailBladeInputs : { resourceUri : site.id }
                },
                this._portalService,
                this._hasSiteWritePermissionStream),

            new DisableableBladeFeature(
                this._translateService.instant(PortalResources.feature_processExplorerName),
                this._translateService.instant(PortalResources.feature_processExplorerName),
                this._translateService.instant(PortalResources.feature_processExplorerInfo),
                "images/process-explorer.svg",
                {
                    detailBlade : "ProcExpNewBlade",
                    detailBladeInputs : { resourceUri : site.id }
                },
                this._portalService,
                this._hasSiteWritePermissionStream),

            new BladeFeature(
                this._translateService.instant(PortalResources.feature_securityScanningName),
                this._translateService.instant(PortalResources.feature_securityScanningName) + " tinfoil",
                this._translateService.instant(PortalResources.feature_securityScanningInfo),
                "images/tinfoil-flat-21px.png",
                {
                    detailBlade : "TinfoilSecurityBlade",
                    detailBladeInputs : { WebsiteId : this._descriptor.getWebsiteId() }
                },
                this._portalService),
        ]

        this.groups2 = [
            new FeatureGroup(this._translateService.instant(PortalResources.feature_networkingName), networkFeatures),
            new FeatureGroup(this._translateService.instant(PortalResources.feature_monitoring), monitoringFeatures)];
    }

    private _initCol3Groups(site : ArmObj<Site>){
        let apiManagementFeatures = [
            new BladeFeature(
                "CORS",
                "cors api",
                this._translateService.instant(PortalResources.feature_corsInfo),
                "images/cors.svg",
                {
                    detailBlade : "ApiCors",
                    detailBladeInputs : { resourceUri : site.id }
                },
                this._portalService),

            new BladeFeature(
                this._translateService.instant(PortalResources.feature_apiDefinitionName),
                this._translateService.instant(PortalResources.feature_apiDefinitionName) + " swagger",
                this._translateService.instant(PortalResources.feature_apiDefinitionInfo),
                "images/api-definition.svg",
                {
                    detailBlade : "ApiDefinition",
                    detailBladeInputs : { resourceUri : site.id }
                },
                this._portalService),
        ]

        let appServicePlanFeatures = [
            new DisableableBladeFeature(
                this._translateService.instant(PortalResources.appServicePlan),
                this._translateService.instant(PortalResources.appServicePlan) +
                    " " + this._translateService.instant(PortalResources.scale),
                this._translateService.instant(PortalResources.feature_appServicePlanInfo),
                "images/app-service-plan.svg",
                {
                    detailBlade : "WebHostingPlanBlade",
                    detailBladeInputs : { id : site.properties.serverFarmId }
                },
                this._portalService,
                this._hasPlanReadPermissionStream),

            new DisableableBladeFeature(
                this._translateService.instant(PortalResources.feature_quotasName),
                this._translateService.instant(PortalResources.feature_quotasName),
                this._translateService.instant(PortalResources.feature_quotasInfo),
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
                this._translateService.instant(PortalResources.feature_activityLogName),
                this._translateService.instant(PortalResources.feature_activityLogName) +
                    " " + this._translateService.instant(PortalResources.feature_activityLogName) +
                    " " + this._translateService.instant(PortalResources.events),
                this._translateService.instant(PortalResources.feature_activityLogInfo),
                "images/activity-log.svg",
                {
                    detailBlade : "EventsBrowseBlade",
                    detailBladeInputs : {
                        queryInputs : {
                            id : site.id
                        }
                    },
                    extension : "Microsoft_Azure_Monitoring"
                },
                this._portalService
            ),

            new BladeFeature(
                this._translateService.instant(PortalResources.feature_accessControlName),
                this._translateService.instant(PortalResources.feature_accessControlName) + " rbac",
                this._translateService.instant(PortalResources.feature_accessControlInfo),
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
                this._translateService.instant(PortalResources.feature_tagsName),
                this._translateService.instant(PortalResources.feature_tagsName),
                this._translateService.instant(PortalResources.feature_tagsInfo),
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
                this._translateService.instant(PortalResources.feature_locksName),
                this._translateService.instant(PortalResources.feature_locksName),
                this._translateService.instant(PortalResources.feature_locksInfo),
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
                this._translateService.instant(PortalResources.feature_automationScriptName),
                this._translateService.instant(PortalResources.feature_automationScriptName) +
                    " " + this._translateService.instant(PortalResources.template) +
                    " arm",
                this._translateService.instant(PortalResources.feature_automationScriptInfo),
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
            new FeatureGroup(this._translateService.instant(PortalResources.feature_api), apiManagementFeatures),
            new FeatureGroup(this._translateService.instant(PortalResources.appServicePlan), appServicePlanFeatures),
            new FeatureGroup(this._translateService.instant(PortalResources.feature_resourceManagement), resourceManagementFeatures)];
    }

    openTab(tabName : string){
        this.openTabEvent.next(tabName);
    }
}

export class OpenKuduFeature extends DisableableFeature{
        constructor(
            private _site : ArmObj<Site>,
            disableInfoStream : Subject<DisableInfo>,
            private _translateService : TranslateService){

        super(
            _translateService.instant(PortalResources.feature_advancedToolsName),
            _translateService.instant(PortalResources.feature_advancedToolsName) + " kudu",
            _translateService.instant(PortalResources.feature_advancedToolsInfo),
            "images/advanced-tools.svg",
            disableInfoStream);
    }

    click(){
        let scmHostName = this._site.properties.hostNameSslStates.find(h => h.hostType === 1).name;
        window.open(`https://${scmHostName}`);
    }
}

export class OpenEditorFeature extends DisableableFeature{
        constructor(private _site : ArmObj<Site>, disabledInfoStream : Subject<DisableInfo>, private _translateService : TranslateService){

        super(
            _translateService.instant(PortalResources.feature_appServiceEditorName),
            _translateService.instant(PortalResources.feature_appServiceEditorName),
            _translateService.instant(PortalResources.feature_appServiceEditorInfo),
            "images/appsvc-editor.svg",
            disabledInfoStream);
    }

    click(){
        let scmHostName = this._site.properties.hostNameSslStates.find(h => h.hostType === 1).name;
        window.open(`https://${scmHostName}/dev`);
    }
}

export class OpenResourceExplorer extends FeatureItem{
        constructor(private _site : ArmObj<Site>, private _translateService : TranslateService){
        super(
            _translateService.instant(PortalResources.feature_resourceExplorerName),
            _translateService.instant(PortalResources.feature_resourceExplorerName),
            _translateService.instant(PortalResources.feature_resourceExplorerInfo),
            "images/resource-explorer.svg");
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
