import { BusyStateScopeManager } from './../../busy-state/busy-state-scope-manager';
import { ScenarioService } from './../../shared/services/scenario/scenario.service';
import { BroadcastService } from './../../shared/services/broadcast.service';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import { SiteTabIds, ScenarioIds } from './../../shared/models/constants';
import { Component, Input, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/zip';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from './../../shared/models/portal-resources';
import { CacheService } from './../../shared/services/cache.service';
import { TreeViewInfo, SiteData } from './../../tree-view/models/tree-view-info';
import { AiService } from './../../shared/services/ai.service';
import { DisableInfo, TabFeature, FeatureItem, BladeFeature, DisableableBladeFeature, DisableableFeature } from './../../feature-group/feature-item';
import { FeatureGroup } from './../../feature-group/feature-group';
import { AuthzService } from '../../shared/services/authz.service';
import { PortalService } from '../../shared/services/portal.service';
import { Site } from '../../shared/models/arm/site';
import { ArmObj } from '../../shared/models/arm/arm-obj';
import { SiteDescriptor } from '../../shared/resourceDescriptors';

@Component({
    selector: 'site-manage',
    templateUrl: './site-manage.component.html',
    styleUrls: ['./site-manage.component.scss'],
})

export class SiteManageComponent implements OnDestroy {
    public groups1: FeatureGroup[];
    public groups2: FeatureGroup[];
    public groups3: FeatureGroup[];

    public searchTerm = '';
    public TabIds = SiteTabIds;

    public viewInfo: TreeViewInfo<SiteData>;

    private _viewInfoStream = new Subject<TreeViewInfo<any>>();
    private _descriptor: SiteDescriptor;

    private _hasSiteWritePermissionStream = new Subject<DisableInfo>();
    private _hasPlanReadPermissionStream = new Subject<DisableInfo>();

    private _selectedFeatureSubscription: RxSubscription;

    private _busyManager: BusyStateScopeManager;

    @Input() set viewInfoInput(viewInfo: TreeViewInfo<SiteData>) {
        this._viewInfoStream.next(viewInfo);
    }

    constructor(
        private _authZService: AuthzService,
        private _portalService: PortalService,
        private _aiService: AiService,
        private _cacheService: CacheService,
        private _translateService: TranslateService,
        private _broadcastService: BroadcastService,
        private _scenarioService: ScenarioService) {

        this._busyManager = new BusyStateScopeManager(_broadcastService, 'site-tabs');

        this._viewInfoStream
            .switchMap(viewInfo => {
                this._busyManager.setBusy();
                this.viewInfo = viewInfo;
                return this._cacheService.getArm(viewInfo.resourceId);
            })
            .switchMap(r => {
                this._busyManager.clearBusy();
                this._aiService.stopTrace('/timings/site/tab/features/revealed', this.viewInfo.data.siteTabRevealedTraceKey);

                const site: ArmObj<Site> = r.json();

                this._portalService.closeBlades();
                this._descriptor = new SiteDescriptor(site.id);
                this._disposeGroups();

                this._initCol1Groups(site);
                this._initCol2Groups(site);
                this._initCol3Groups(site);

                return Observable.zip(
                    this._authZService.hasPermission(site.id, [AuthzService.writeScope]),
                    this._authZService.hasPermission(site.properties.serverFarmId, [AuthzService.readScope]),
                    this._authZService.hasReadOnlyLock(site.id),
                    (s, p, l) => ({ hasSiteWritePermissions: s, hasPlanReadPermissions: p, hasReadOnlyLock: l })
                );
            })
            .do(null, e => {
                this._aiService.trackException(e, 'site-manage');
            })
            .retry()
            .subscribe(r => {

                this._aiService.stopTrace('/timings/site/tab/features/full-ready', this.viewInfo.data.siteTabFullReadyTraceKey);
                let siteWriteDisabledMessage = '';

                if (!r.hasSiteWritePermissions) {
                    siteWriteDisabledMessage = this._translateService.instant(PortalResources.featureRequiresWritePermissionOnApp);
                } else if (r.hasReadOnlyLock) {
                    siteWriteDisabledMessage = this._translateService.instant(PortalResources.featureDisabledReadOnlyLockOnApp);
                }

                this._hasSiteWritePermissionStream.next({
                    enabled: r.hasSiteWritePermissions && !r.hasReadOnlyLock,
                    disableMessage: siteWriteDisabledMessage
                });

                this._hasPlanReadPermissionStream.next({
                    enabled: r.hasPlanReadPermissions,
                    disableMessage: this._translateService.instant(PortalResources.featureDisabledNoPermissionToPlan)
                });
            });
    }

    ngOnDestroy() {
        this._busyManager.clearBusy();
        this._portalService.closeBlades();
        this._disposeGroups();
        if (this._selectedFeatureSubscription) {
            this._selectedFeatureSubscription.unsubscribe();
            this._selectedFeatureSubscription = null;
        }
    }

    private _disposeGroups() {
        if (this.groups1) {
            this.groups1.forEach(group => {
                this._disposeGroup(group);
            });
        }

        if (this.groups2) {
            this.groups2.forEach(group => {
                this._disposeGroup(group);
            });
        }

        if (this.groups3) {
            this.groups3.forEach(group => {
                this._disposeGroup(group);
            });
        }
    }

    private _disposeGroup(group: FeatureGroup) {
        group.features.forEach(feature => {
            feature.dispose();
        });
    }

    //Bug 10307095:[RTM] [BugBash] Use Environment Switcher to properly enable and disable feature in OnPrem
    private _isOnprem() : boolean {
        return window.appsvc.env.runtimeType === "OnPrem";
    }

    private _initCol1Groups(site : ArmObj<Site>){
        let codeDeployFeatures = [
            new DisableableBladeFeature(
                this._translateService.instant(PortalResources.feature_deploymentSourceName),
                this._translateService.instant(PortalResources.continuousDeployment) +
                ' ' + this._translateService.instant(PortalResources.source) +
                ' ' + this._translateService.instant(PortalResources.options) +
                '  github bitbucket dropbox onedrive vsts vso',
                this._translateService.instant(PortalResources.feature_deploymentSourceInfo),
                'image/deployment-source.svg',
                {
                    detailBlade: 'ContinuousDeploymentListBlade',
                    detailBladeInputs: {
                        id: this._descriptor.resourceId,
                        ResourceId: this._descriptor.resourceId
                    }
                },
                this._portalService,
                this._hasSiteWritePermissionStream),

            new BladeFeature(
                this._translateService.instant(PortalResources.feature_deploymentCredsName),
                this._translateService.instant(PortalResources.feature_deploymentCredsName),
                this._translateService.instant(PortalResources.feature_deploymentCredsInfo),
                'image/deployment-credentials.svg',
                {
                    detailBlade: 'FtpCredentials',
                    detailBladeInputs: {
                        WebsiteId: this._descriptor.getWebsiteId()
                    }
                },
                this._portalService)
        ];

        const developmentToolFeatures = [
            new TabFeature(
                this._translateService.instant(PortalResources.tab_logicApps),
                this._translateService.instant(PortalResources.tab_logicApps),
                this._translateService.instant(PortalResources.feature_logicAppsInfo),
                'image/logicapp.svg',
                SiteTabIds.logicApps,
                this._broadcastService),


            this._scenarioService.checkScenario(ScenarioIds.addConsole, { site: site }).status !== 'disabled'
                ? new DisableableBladeFeature(
                    this._translateService.instant(PortalResources.feature_consoleName),
                    this._translateService.instant(PortalResources.feature_consoleName) +
                    ' ' + this._translateService.instant(PortalResources.debug),
                    this._translateService.instant(PortalResources.feature_consoleInfo),
                    'image/console.svg',
                    {
                        detailBlade: 'ConsoleBlade',
                        detailBladeInputs: {
                            resourceUri: site.id
                        }
                    },
                    this._portalService,
                    this._hasSiteWritePermissionStream)
                : null,

            this._scenarioService.checkScenario(ScenarioIds.addSsh, { site: site }).status === 'enabled'
                ? new OpenSshFeature(site, this._hasSiteWritePermissionStream, this._translateService)
                : null,

            new OpenKuduFeature(site, this._hasSiteWritePermissionStream, this._translateService),

            new OpenEditorFeature(site, this._hasSiteWritePermissionStream, this._translateService, this._scenarioService),

            this._scenarioService.checkScenario(ScenarioIds.addResourceExplorer, { site: site }).status !== 'disabled'
                ? new OpenResourceExplorer(site, this._translateService)
                : null,

            new DisableableBladeFeature(
                this._translateService.instant(PortalResources.feature_extensionsName),
                this._translateService.instant(PortalResources.feature_extensionsName),
                this._translateService.instant(PortalResources.feature_extensionsInfo),
                'image/extensions.svg',
                {
                    detailBlade: 'SiteExtensionsListBlade',
                    detailBladeInputs: {
                        WebsiteId: this._descriptor.getWebsiteId()
                    }
                },
                this._portalService,
                this._hasSiteWritePermissionStream,
                this._scenarioService.checkScenario(ScenarioIds.enableExtensions, { site: site })),
        ];

        const generalFeatures: FeatureItem[] = [
            new TabFeature(
                this._translateService.instant(PortalResources.tab_functionSettings),
                this._translateService.instant(PortalResources.tab_functionSettings),
                this._translateService.instant(PortalResources.feature_functionSettingsInfo),
                'image/functions.svg',
                SiteTabIds.functionRuntime,
                this._broadcastService),

            new TabFeature(
                this._translateService.instant(PortalResources.tab_applicationSettings),
                this._translateService.instant(PortalResources.tab_applicationSettings),
                this._translateService.instant(PortalResources.feature_applicationSettingsInfo),
                'image/application-settings.svg',
                SiteTabIds.applicationSettings,
                this._broadcastService),

            new BladeFeature(
                this._translateService.instant(PortalResources.feature_propertiesName),
                this._translateService.instant(PortalResources.feature_propertiesName),
                this._translateService.instant(PortalResources.feature_propertiesInfo),
                'image/properties.svg',
                {
                    detailBlade: 'PropertySheetBlade',
                    detailBladeInputs: {
                        resourceId: this._descriptor.resourceId,
                    }
                },
                this._portalService),

            new DisableableBladeFeature(
                this._translateService.instant(PortalResources.feature_backupsName),
                this._translateService.instant(PortalResources.feature_backupsName),
                this._translateService.instant(PortalResources.feature_backupsInfo),
                'image/backups.svg',
                {
                    detailBlade: 'BackupSummaryBlade',
                    detailBladeInputs: {
                        resourceUri: site.id
                    }
                },
                this._portalService,
                this._hasSiteWritePermissionStream,
                this._scenarioService.checkScenario(ScenarioIds.enableBackups, { site: site })),

            new BladeFeature(
                this._translateService.instant(PortalResources.feature_allSettingsName),
                this._translateService.instant(PortalResources.feature_allSettingsName) +
                ' ' + this._translateService.instant(PortalResources.supportRequest) +
                ' ' + this._translateService.instant(PortalResources.scale),
                this._translateService.instant(PortalResources.feature_allSettingsInfo),
                'image/webapp.svg',
                {
                    detailBlade : this._isOnprem() ? "WebsiteBlade" : "AppsOverviewBlade",
                    detailBladeInputs : {
                        id : site.id
                    }
                },
                this._portalService)
        ];

        // Instead of setting null in Features array, We are removing it here to minimize merge conflict
        // PLease remove it after merge from dev and fix properly with environmentswicther
        if (this._isOnprem()) {
            developmentToolFeatures.splice(3,1); //removing ResourceExplorer
        }

        this.groups1 = [
            new FeatureGroup(this._translateService.instant(PortalResources.feature_generalSettings), generalFeatures),
            new FeatureGroup(this._translateService.instant(PortalResources.feature_codeDeployment), codeDeployFeatures),
            new FeatureGroup(
                this._translateService.instant(PortalResources.feature_developmentTools),
                developmentToolFeatures.filter(f => !!f))
        ];
    }

    private _initCol2Groups(site: ArmObj<Site>) {

        const networkFeatures = [
            new DisableableBladeFeature(
                this._translateService.instant(PortalResources.feature_networkingName),
                this._translateService.instant(PortalResources.feature_networkingName) +
                ' ' + this._translateService.instant(PortalResources.hybridConnections) +
                ' vnet',
                this._translateService.instant(PortalResources.feature_networkingInfo),
                'image/networking.svg',
                {
                    detailBlade: 'NetworkSummaryBlade',
                    detailBladeInputs: {
                        resourceUri: site.id
                    }
                },
                this._portalService,
                this._hasSiteWritePermissionStream,
                this._scenarioService.checkScenario(ScenarioIds.enableNetworking, { site: site })),

            new DisableableBladeFeature(
                'SSL',
                'ssl',
                this._translateService.instant(PortalResources.feature_sslInfo),
                'image/ssl.svg',
                {
                    detailBlade: 'CertificatesBlade',
                    detailBladeInputs: { resourceUri: site.id }
                },
                this._portalService,
                this._hasSiteWritePermissionStream),

            new DisableableBladeFeature(
                this._translateService.instant(PortalResources.feature_customDomainsName),
                this._translateService.instant(PortalResources.feature_customDomainsName),
                this._translateService.instant(PortalResources.feature_customDomainsInfo),
                'image/custom-domains.svg',
                {
                    detailBlade: 'CustomDomainsAndSSL',
                    detailBladeInputs: {
                        resourceUri: this._descriptor.resourceId,
                        BuyDomainSelected: false
                    }
                },
                this._portalService,
                this._hasSiteWritePermissionStream),

            new DisableableBladeFeature(
                this._translateService.instant(PortalResources.feature_authName),
                this._translateService.instant(PortalResources.authentication) +
                ' ' + this._translateService.instant(PortalResources.authorization) +
                ' aad google facebook microsoft',
                this._translateService.instant(PortalResources.feature_authInfo),
                'image/authentication.svg',
                {
                    detailBlade: 'AppAuth',
                    detailBladeInputs: { resourceUri: site.id }
                },
                this._portalService,
                this._hasSiteWritePermissionStream,
                this._scenarioService.checkScenario(ScenarioIds.enableAuth, { site: site })),

            this._scenarioService.checkScenario(ScenarioIds.addMsi, { site: site }).status !== 'disabled'
                ? new DisableableBladeFeature(
                    this._translateService.instant(PortalResources.feature_msiName),
                    this._translateService.instant(PortalResources.feature_msiName) +
                    this._translateService.instant(PortalResources.authentication) +
                    'MSI',
                    this._translateService.instant(PortalResources.feature_msiInfo),
                    'image/toolbox.svg',
                    {
                        detailBlade: 'MSIBlade',
                        detailBladeInputs: { resourceUri: site.id }
                    },
                    this._portalService,
                    null,
                    this._scenarioService.checkScenario(ScenarioIds.enableMsi, { site: site }))
                : null,

            this._scenarioService.checkScenario(ScenarioIds.addPushNotifications, { site: site }).status !== 'disabled'
                ? new DisableableBladeFeature(
                    this._translateService.instant(PortalResources.feature_pushNotificationsName),
                    this._translateService.instant(PortalResources.feature_pushNotificationsName),
                    this._translateService.instant(PortalResources.feature_pushNotificationsInfo),
                    'image/push.svg',
                    {
                        detailBlade: 'PushRegistrationBlade',
                        detailBladeInputs: { resourceUri: this._descriptor.resourceId }
                    },
                    this._portalService,
                    this._hasSiteWritePermissionStream,
                    this._scenarioService.checkScenario(ScenarioIds.enablePushNotifications, { site: site }))
                : null,
        ];

        const monitoringFeatures = [
            new BladeFeature(
                this._translateService.instant(PortalResources.feature_diagnosticLogsName),
                this._translateService.instant(PortalResources.feature_diagnosticLogsName),
                this._translateService.instant(PortalResources.feature_diagnosticLogsInfo),
                'image/diagnostic-logs.svg',
                {
                    detailBlade: 'WebsiteLogsBlade',
                    detailBladeInputs: { WebsiteId: this._descriptor.getWebsiteId() }
                },
                this._portalService),

            new DisableableBladeFeature(
                this._translateService.instant(PortalResources.feature_logStreamingName),
                this._translateService.instant(PortalResources.feature_logStreamingName),
                this._translateService.instant(PortalResources.feature_logStreamingInfo),
                'image/log-stream.svg',
                {
                    detailBlade: 'LogStreamBlade',
                    detailBladeInputs: { resourceUri: site.id }
                },
                this._portalService,
                this._hasSiteWritePermissionStream,
                this._scenarioService.checkScenario(ScenarioIds.enableLogStream, { site: site })),

            new DisableableBladeFeature(
                this._translateService.instant(PortalResources.feature_processExplorerName),
                this._translateService.instant(PortalResources.feature_processExplorerName),
                this._translateService.instant(PortalResources.feature_processExplorerInfo),
                'image/process-explorer.svg',
                {
                    detailBlade: 'ProcExpNewBlade',
                    detailBladeInputs: { resourceUri: site.id }
                },
                this._portalService,
                this._hasSiteWritePermissionStream,
                this._scenarioService.checkScenario(ScenarioIds.enableProcessExplorer, { site: site }))
        ];

        // Instead of setting null in Features array, We are removing it here to minimize merge conflict
        // PLease remove it after merge from dev and fix properly with environmentswicther
        if (this._isOnprem()) {
            networkFeatures.splice(0,1); // Networking
            networkFeatures.splice(3,1); // push notification
            monitoringFeatures.splice(3,1); // Security scanning
        }

        this.groups2 = [
            new FeatureGroup(
                this._translateService.instant(PortalResources.feature_networkingName),
                networkFeatures.filter(f => !!f)),
            new FeatureGroup(
                this._translateService.instant(PortalResources.feature_monitoring),
                monitoringFeatures.filter(f => !!f))];
    }

    private _initCol3Groups(site: ArmObj<Site>) {
        const apiManagementFeatures: FeatureItem[] = [
            new TabFeature(
                this._translateService.instant(PortalResources.feature_apiDefinitionName),
                this._translateService.instant(PortalResources.feature_apiDefinitionName) + ' swagger',
                this._translateService.instant(PortalResources.feature_apiDefinitionInfo),
                'image/api-definition.svg',
                SiteTabIds.apiDefinition,
                this._broadcastService
            ),

            new BladeFeature(
                'CORS',
                'cors api',
                this._translateService.instant(PortalResources.feature_corsInfo),
                'image/cors.svg',
                {
                    detailBlade: 'ApiCors',
                    detailBladeInputs: { resourceUri: site.id }
                },
                this._portalService)
        ];

        const appServicePlanFeatures = [
            new DisableableBladeFeature(
                this._translateService.instant(PortalResources.appServicePlan),
                this._translateService.instant(PortalResources.appServicePlan) +
                ' ' + this._translateService.instant(PortalResources.scale),
                this._translateService.instant(PortalResources.feature_appServicePlanInfo),
                'image/app-service-plan.svg',
                {
                    detailBlade: 'WebHostingPlanBlade',
                    detailBladeInputs: { id: site.properties.serverFarmId }
                },
                this._portalService,
                this._hasPlanReadPermissionStream),

            this._scenarioService.checkScenario(ScenarioIds.addSiteQuotas, { site: site }).status !== 'disabled'
                ? new DisableableBladeFeature(
                    this._translateService.instant(PortalResources.feature_quotasName),
                    this._translateService.instant(PortalResources.feature_quotasName),
                    this._translateService.instant(PortalResources.feature_quotasInfo),
                    'image/quotas.svg',
                    {
                        detailBlade: 'QuotasBlade',
                        detailBladeInputs: {
                            resourceUri: site.id
                        }
                    },
                    this._portalService,
                    this._hasPlanReadPermissionStream)
                : null,

            this._scenarioService.checkScenario(ScenarioIds.addSiteFileStorage, { site: site }).status !== 'disabled'
                ? new DisableableBladeFeature(
                    this._translateService.instant(PortalResources.feature_quotasName),
                    this._translateService.instant(PortalResources.feature_quotasName),
                    this._translateService.instant(PortalResources.feature_quotasInfo),
                    'image/quotas.svg',
                    {
                        detailBlade: 'FileSystemStorage',
                        detailBladeInputs: {
                            resourceUri: site.properties.serverFarmId
                        }
                    },
                    this._portalService,
                    this._hasPlanReadPermissionStream)
                : null
        ];

        const resourceManagementFeatures = [
            new BladeFeature(
                this._translateService.instant(PortalResources.feature_activityLogName),
                this._translateService.instant(PortalResources.feature_activityLogName) +
                ' ' + this._translateService.instant(PortalResources.feature_activityLogName) +
                ' ' + this._translateService.instant(PortalResources.events),
                this._translateService.instant(PortalResources.feature_activityLogInfo),
                'image/activity-log.svg',
                {
                    detailBlade: 'EventsBrowseBlade',
                    detailBladeInputs: {
                        queryInputs: {
                            id: site.id
                        }
                    },
                    extension: 'Microsoft_Azure_Monitoring'
                },
                this._portalService
            ),

            new BladeFeature(
                this._translateService.instant(PortalResources.feature_accessControlName),
                this._translateService.instant(PortalResources.feature_accessControlName) + ' rbac',
                this._translateService.instant(PortalResources.feature_accessControlInfo),
                'image/access-control.svg',
                {
                    detailBlade: 'UserAssignmentsV2Blade',
                    detailBladeInputs: {
                        scope: site.id
                    },
                    extension: 'Microsoft_Azure_AD'
                },
                this._portalService
            ),

            new BladeFeature(
                this._translateService.instant(PortalResources.feature_tagsName),
                this._translateService.instant(PortalResources.feature_tagsName),
                this._translateService.instant(PortalResources.feature_tagsInfo),
                'image/tags.svg',
                {
                    detailBlade: 'ResourceTagsListBlade',
                    detailBladeInputs: {
                        resourceId: site.id
                    },
                    extension: 'HubsExtension'
                },
                this._portalService
            ),

            new BladeFeature(
                this._translateService.instant(PortalResources.feature_locksName),
                this._translateService.instant(PortalResources.feature_locksName),
                this._translateService.instant(PortalResources.feature_locksInfo),
                'image/locks.svg',
                {
                    detailBlade: 'LocksBlade',
                    detailBladeInputs: {
                        resourceId: site.id
                    },
                    extension: 'HubsExtension'
                },
                this._portalService),

            // new NotImplementedFeature('Clone app', 'clone app', 'Info'),  // TODO: ellhamai - Need to implent

            new BladeFeature(
                this._translateService.instant(PortalResources.feature_automationScriptName),
                this._translateService.instant(PortalResources.feature_automationScriptName) +
                ' ' + this._translateService.instant(PortalResources.template) +
                ' arm',
                this._translateService.instant(PortalResources.feature_automationScriptInfo),
                'image/automation-script.svg',
                {
                    detailBlade: 'TemplateViewerBlade',
                    detailBladeInputs: {
                        options: {
                            resourceGroup: `/subscriptions/${this._descriptor.subscription}/resourcegroups/${this._descriptor.resourceGroup}`,
                            telemetryId: 'Microsoft.Web/sites'
                        },
                        stepOutput: null
                    },
                    extension: 'HubsExtension'
                },
                this._portalService),

            // new NotImplementedFeature(  // TODO: ellhamai - Need to implement
            //     'New support request',
            //     'support request',
            //     'Info'),
        ];

        // Instead of setting null in Features array, We are removing it here to minimize merge conflict
        // PLease remove it after merge from dev and fix properly with environmentswicther
        if (this._isOnprem()) {
            resourceManagementFeatures.splice(4,1); //Automation script
        }
        this.groups3 = [
            new FeatureGroup(this._translateService.instant(PortalResources.feature_api), apiManagementFeatures),
            new FeatureGroup(
                this._translateService.instant(PortalResources.appServicePlan),
                appServicePlanFeatures.filter(f => !!f)),
            new FeatureGroup(this._translateService.instant(PortalResources.feature_resourceManagement), resourceManagementFeatures)];
    }
}

export class OpenSshFeature extends DisableableFeature {
    constructor(
        private _site: ArmObj<Site>,
        disableInfoStream: Subject<DisableInfo>,
        _translateService: TranslateService) {

        super(
            _translateService.instant(PortalResources.feature_sshName),
            _translateService.instant(PortalResources.feature_sshName)
            + _translateService.instant(PortalResources.feature_consoleName),
            _translateService.instant(PortalResources.feature_sshInfo),
            'image/console.svg',
            disableInfoStream);
    }

    click() {
        const scmHostName = this._site.properties.hostNameSslStates.find(h => h.hostType === 1).name;
        window.open(`https://${scmHostName}/webssh/host`);
    }
}

export class OpenKuduFeature extends DisableableFeature {
    constructor(
        private _site: ArmObj<Site>,
        disableInfoStream: Subject<DisableInfo>,
        _translateService: TranslateService) {

        super(
            _translateService.instant(PortalResources.feature_advancedToolsName),
            _translateService.instant(PortalResources.feature_advancedToolsName) + ' kudu',
            _translateService.instant(PortalResources.feature_advancedToolsInfo),
            'image/advanced-tools.svg',
            disableInfoStream);
    }

    click() {
        const scmHostName = this._site.properties.hostNameSslStates.find(h => h.hostType === 1).name;
        window.open(`https://${scmHostName}`);
    }
}

export class OpenEditorFeature extends DisableableFeature {
    constructor(
        private _site: ArmObj<Site>,
        disabledInfoStream: Subject<DisableInfo>,
        _translateService: TranslateService,
        scenarioService: ScenarioService) {

        super(
            _translateService.instant(PortalResources.feature_appServiceEditorName),
            _translateService.instant(PortalResources.feature_appServiceEditorName),
            _translateService.instant(PortalResources.feature_appServiceEditorInfo),
            'image/appsvc-editor.svg',
            disabledInfoStream, scenarioService.checkScenario(ScenarioIds.enableAppServiceEditor, { site: _site }));
    }

    click() {
        const scmHostName = this._site.properties.hostNameSslStates.find(h => h.hostType === 1).name;
        window.open(`https://${scmHostName}/dev`);
    }
}

export class OpenResourceExplorer extends FeatureItem {
    constructor(private _site: ArmObj<Site>, _translateService: TranslateService) {
        super(
            _translateService.instant(PortalResources.feature_resourceExplorerName),
            _translateService.instant(PortalResources.feature_resourceExplorerName),
            _translateService.instant(PortalResources.feature_resourceExplorerInfo),
            'image/resource-explorer.svg');
    }

    click() {
        window.open(`https://resources.azure.com${this._site.id}`);
    }
}

export class NotImplementedFeature extends FeatureItem {
    constructor(
        title: string,
        keywords: string,
        info: string) {

        super(title, keywords, info);
    }

    click() {
        alert('Not implemented');
    }
}
