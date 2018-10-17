import { SiteService } from 'app/shared/services/site.service';
import { ScenarioService } from './../../shared/services/scenario/scenario.service';
import { ScenarioIds, SiteTabIds } from './../../shared/models/constants';
import { Component, Input, OnDestroy, Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from './../../shared/models/portal-resources';
import { TreeViewInfo, SiteData } from './../../tree-view/models/tree-view-info';
import {
  DisableInfo,
  TabFeature,
  FeatureItem,
  BladeFeature,
  DisableableBladeFeature,
  DisableableFeature,
  DisableableTabFeature,
} from './../../feature-group/feature-item';
import { FeatureGroup } from './../../feature-group/feature-group';
import { AuthzService } from '../../shared/services/authz.service';
import { PortalService } from '../../shared/services/portal.service';
import { Site } from '../../shared/models/arm/site';
import { ArmObj } from '../../shared/models/arm/arm-obj';
import { ArmSiteDescriptor } from '../../shared/resourceDescriptors';
import { Url } from 'app/shared/Utilities/url';
import { FeatureComponent } from 'app/shared/components/feature-component';
import { ArmUtil } from '../../shared/Utilities/arm-utils';

@Component({
  selector: 'site-manage',
  templateUrl: './site-manage.component.html',
  styleUrls: ['./site-manage.component.scss'],
})
export class SiteManageComponent extends FeatureComponent<TreeViewInfo<SiteData>> implements OnDestroy {
  public groups1: FeatureGroup[];
  public groups2: FeatureGroup[];
  public groups3: FeatureGroup[];

  public searchTerm = '';

  private _descriptor: ArmSiteDescriptor;
  private _hasSiteWritePermissionStream = new Subject<DisableInfo>();
  private _hasPlanReadPermissionStream = new Subject<DisableInfo>();
  private _hasPlanWritePermissionStream = new Subject<DisableInfo>();

  @Input()
  set viewInfoInput(viewInfo: TreeViewInfo<SiteData>) {
    this.setInput(viewInfo);
  }

  constructor(
    private _authZService: AuthzService,
    private _portalService: PortalService,
    private _siteService: SiteService,
    private _translateService: TranslateService,
    private _scenarioService: ScenarioService,
    injector: Injector
  ) {
    super('site-manage', injector, SiteTabIds.platformFeatures);

    this.featureName = this.componentName;
    this.isParentComponent = true;
  }

  protected setup(inputEvents: Observable<TreeViewInfo<SiteData>>) {
    return inputEvents
      .switchMap(viewInfo => {
        return this._siteService.getSite(viewInfo.resourceId);
      })
      .switchMap(r => {
        this.clearBusyEarly();
        const site: ArmObj<Site> = r.result;

        this._portalService.closeBlades();
        this._descriptor = new ArmSiteDescriptor(site.id);
        this._disposeGroups();

        this._initCol1Groups(site);
        this._initCol2Groups(site);
        this._initCol3Groups(site);

        return Observable.zip(
          this._authZService.hasPermission(site.id, [AuthzService.writeScope]),
          this._authZService.hasPermission(site.properties.serverFarmId, [AuthzService.readScope]),
          this._authZService.hasPermission(site.properties.serverFarmId, [AuthzService.writeScope]),
          this._authZService.hasReadOnlyLock(site.id)
        );
      })
      .do(r => {
        let siteWriteDisabledMessage = '';

        const hasSiteWritePermissions = r[0];
        const hasPlanReadPermissions = r[1];
        const hasPlanWritePermissions = r[2];
        const hasReadOnlyLock = r[3];

        if (!hasSiteWritePermissions) {
          siteWriteDisabledMessage = this._translateService.instant(PortalResources.featureRequiresWritePermissionOnApp);
        } else if (hasReadOnlyLock) {
          siteWriteDisabledMessage = this._translateService.instant(PortalResources.featureDisabledReadOnlyLockOnApp);
        }

        this._hasSiteWritePermissionStream.next({
          enabled: hasSiteWritePermissions && !hasReadOnlyLock,
          disableMessage: siteWriteDisabledMessage,
        });

        this._hasPlanReadPermissionStream.next({
          enabled: hasPlanReadPermissions,
          disableMessage: this._translateService.instant(PortalResources.featureDisabledNoPermissionToPlan),
        });

        this._hasPlanWritePermissionStream.next({
          enabled: hasPlanWritePermissions,
          disableMessage: 'This feature requires write permissions on the plan',
        });
      });
  }

  ngOnDestroy() {
    this.clearBusy();
    this._portalService.closeBlades();
    this._disposeGroups();
    super.ngOnDestroy();
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
  private _isOnprem(): boolean {
    return window.appsvc.env.runtimeType === 'OnPrem';
  }

  private _initCol1Groups(site: ArmObj<Site>) {
    const codeDeployFeatures = [];
    const showDeploymentCenterFlag = Url.getParameterByName(null, 'appsvc.deploymentcenter');
    const deploymentCenterEnabled = this._scenarioService.checkScenario(ScenarioIds.deploymentCenter, { site }).data !== 'disabled';
    if (deploymentCenterEnabled || showDeploymentCenterFlag) {
      const deploymentCenterFeature = new TabFeature(
        this._translateService.instant(PortalResources.deploymentCenterTitle),
        this._translateService.instant(PortalResources.continuousDeployment) +
          ' ' +
          this._translateService.instant(PortalResources.source) +
          ' ' +
          this._translateService.instant(PortalResources.options) +
          '  github bitbucket dropbox onedrive vsts vso',
        this._translateService.instant(PortalResources.feature_deploymentSourceInfo),
        'image/deployment-source.svg',
        SiteTabIds.continuousDeployment,
        this._broadcastService
      );
      codeDeployFeatures.push(deploymentCenterFeature);
    }

    const developmentToolFeatures = [];
    if (this._scenarioService.checkScenario(ScenarioIds.addLogicApps, { site: site }).status !== 'disabled') {
      developmentToolFeatures.push(
        new TabFeature(
          this._translateService.instant(PortalResources.tab_logicApps),
          this._translateService.instant(PortalResources.tab_logicApps),
          this._translateService.instant(PortalResources.feature_logicAppsInfo),
          'image/logicapp.svg',
          SiteTabIds.logicApps,
          this._broadcastService
        )
      );
    }

    if (
      this._scenarioService.checkScenario(ScenarioIds.addConsole, { site: site }).status !== 'disabled' ||
      this._scenarioService.checkScenario(ScenarioIds.addSsh, { site: site }).status === 'enabled'
    ) {
      developmentToolFeatures.push(
        new TabFeature(
          this._getConsoleName(site),
          this._translateService.instant(PortalResources.feature_consoleName) +
            ' ' +
            this._translateService.instant(PortalResources.feature_cmdConsoleName) +
            ' ' +
            this._translateService.instant(PortalResources.feature_bashConsoleName) +
            ' ' +
            this._translateService.instant(PortalResources.feature_powerShellConsoleName) +
            ' ' +
            this._translateService.instant(PortalResources.feature_sshConsoleName) +
            ' ' +
            this._translateService.instant(PortalResources.debug),
          this._translateService.instant(PortalResources.feature_consoleInfo),
          'image/console.svg',
          SiteTabIds.console,
          this._broadcastService
        )
      );
    }

    developmentToolFeatures.push(new OpenKuduFeature(site, this._hasSiteWritePermissionStream, this._translateService));
    developmentToolFeatures.push(
      new OpenEditorFeature(site, this._hasSiteWritePermissionStream, this._translateService, this._scenarioService)
    );

    if (this._scenarioService.checkScenario(ScenarioIds.addResourceExplorer, { site: site }).status !== 'disabled') {
      developmentToolFeatures.push(new OpenResourceExplorer(site, this._translateService));
    }

    developmentToolFeatures.push(
      new DisableableBladeFeature(
        this._translateService.instant(PortalResources.feature_extensionsName),
        this._translateService.instant(PortalResources.feature_extensionsName),
        this._translateService.instant(PortalResources.feature_extensionsInfo),
        'image/extensions.svg',
        {
          detailBlade: 'SiteExtensionsListBlade',
          detailBladeInputs: {
            WebsiteId: this._descriptor.getWebsiteId(),
          },
        },
        this._portalService,
        this._hasSiteWritePermissionStream,
        this._scenarioService.checkScenario(ScenarioIds.enableExtensions, { site: site })
      )
    );

    const generalFeatures: FeatureItem[] = [
      new TabFeature(
        this._translateService.instant(PortalResources.tab_functionSettings),
        this._translateService.instant(PortalResources.tab_functionSettings),
        this._translateService.instant(PortalResources.feature_functionSettingsInfo),
        'image/functions.svg',
        SiteTabIds.functionRuntime,
        this._broadcastService
      ),

      new TabFeature(
        this._translateService.instant(PortalResources.tab_applicationSettings),
        this._translateService.instant(PortalResources.tab_applicationSettings),
        this._translateService.instant(PortalResources.feature_applicationSettingsInfo),
        'image/application-settings.svg',
        SiteTabIds.applicationSettings,
        this._broadcastService
      ),

      new BladeFeature(
        this._translateService.instant(PortalResources.feature_propertiesName),
        this._translateService.instant(PortalResources.feature_propertiesName),
        this._translateService.instant(PortalResources.feature_propertiesInfo),
        'image/properties.svg',
        {
          detailBlade: 'PropertySheetBlade',
          detailBladeInputs: {
            resourceId: this._descriptor.resourceId,
          },
          openAsContextBlade: true,
        },
        this._portalService
      ),

      new DisableableBladeFeature(
        this._translateService.instant(PortalResources.feature_backupsName),
        this._translateService.instant(PortalResources.feature_backupsName),
        this._translateService.instant(PortalResources.feature_backupsInfo),
        'image/backups.svg',
        {
          detailBlade: 'BackupSummaryBlade',
          detailBladeInputs: {
            resourceUri: site.id,
          },
        },
        this._portalService,
        this._hasSiteWritePermissionStream,
        this._scenarioService.checkScenario(ScenarioIds.enableBackups, { site: site })
      ),

      // need to show only in V2
      // new TabFeature(
      //     this._translateService.instant(PortalResources.quickstart),
      //     this._translateService.instant(PortalResources.quickstart),
      //     this._translateService.instant(PortalResources.quickstartDescription),
      //     'image/quickstart.svg',
      //     SiteTabIds.quickstart,
      //     this._broadcastService
      // ),

      new BladeFeature(
        this._translateService.instant(PortalResources.feature_allSettingsName),
        this._translateService.instant(PortalResources.feature_allSettingsName) +
          ' ' +
          this._translateService.instant(PortalResources.supportRequest) +
          ' ' +
          this._translateService.instant(PortalResources.scale),
        this._translateService.instant(PortalResources.feature_allSettingsInfo),
        'image/webapp.svg',
        {
          detailBlade: this._isOnprem() ? 'WebsiteBlade' : 'AppsOverviewBlade',
          detailBladeInputs: {
            id: site.id,
          },
        },
        this._portalService
      ),
    ];

    // Instead of setting null in Features array, We are removing it here to minimize merge conflict
    // PLease remove it after merge from dev and fix properly with environmentswicther
    if (this._isOnprem()) {
      developmentToolFeatures.splice(3, 1); //removing ResourceExplorer
    }

    this.groups1 = [
      new FeatureGroup(this._translateService.instant(PortalResources.feature_generalSettings), generalFeatures),
      new FeatureGroup(this._translateService.instant(PortalResources.feature_codeDeployment), codeDeployFeatures),
      new FeatureGroup(this._translateService.instant(PortalResources.feature_developmentTools), developmentToolFeatures.filter(f => !!f)),
    ];
  }

  private _initCol2Groups(site: ArmObj<Site>) {
    const networkFeatures = [
      new DisableableBladeFeature(
        this._translateService.instant(PortalResources.feature_networkingName),
        this._translateService.instant(PortalResources.feature_networkingName) +
          ' ' +
          this._translateService.instant(PortalResources.hybridConnections) +
          ' vnet',
        this._translateService.instant(PortalResources.feature_networkingInfo),
        'image/networking.svg',
        {
          detailBlade: 'NetworkSummaryBlade',
          detailBladeInputs: {
            resourceUri: site.id,
          },
        },
        this._portalService,
        this._hasSiteWritePermissionStream,
        this._scenarioService.checkScenario(ScenarioIds.enableNetworking, { site: site })
      ),

      new DisableableBladeFeature(
        'SSL',
        'ssl',
        this._translateService.instant(PortalResources.feature_sslInfo),
        'image/ssl.svg',
        {
          detailBlade: 'CertificatesBlade',
          detailBladeInputs: { resourceUri: site.id },
        },
        this._portalService,
        this._hasSiteWritePermissionStream
      ),

      new DisableableBladeFeature(
        this._translateService.instant(PortalResources.feature_customDomainsName),
        this._translateService.instant(PortalResources.feature_customDomainsName),
        this._translateService.instant(PortalResources.feature_customDomainsInfo),
        'image/custom-domains.svg',
        {
          detailBlade: 'CustomDomainsAndSSL',
          detailBladeInputs: {
            resourceUri: this._descriptor.resourceId,
            BuyDomainSelected: false,
          },
        },
        this._portalService,
        this._hasSiteWritePermissionStream
      ),

      new DisableableBladeFeature(
        this._translateService.instant(PortalResources.feature_authName),
        this._translateService.instant(PortalResources.authentication) +
          ' ' +
          this._translateService.instant(PortalResources.authorization) +
          ' aad google facebook microsoft',
        this._translateService.instant(PortalResources.feature_authInfo),
        'image/authentication.svg',
        {
          detailBlade: 'AppAuth',
          detailBladeInputs: { resourceUri: site.id },
        },
        this._portalService,
        this._hasSiteWritePermissionStream,
        this._scenarioService.checkScenario(ScenarioIds.enableAuth, { site: site })
      ),
    ];

    if (this._scenarioService.checkScenario(ScenarioIds.addMsi, { site: site }).status !== 'disabled') {
      networkFeatures.push(
        new DisableableBladeFeature(
          this._translateService.instant(PortalResources.feature_msiName),
          this._translateService.instant(PortalResources.feature_msiName) +
            this._translateService.instant(PortalResources.authentication) +
            'MSI',
          this._translateService.instant(PortalResources.feature_msiInfo),
          'image/toolbox.svg',
          {
            detailBlade: 'MSIBlade',
            detailBladeInputs: { resourceUri: site.id },
          },
          this._portalService,
          null,
          this._scenarioService.checkScenario(ScenarioIds.enableMsi, { site: site })
        )
      );
    }

    if (this._scenarioService.checkScenario(ScenarioIds.addPushNotifications, { site: site }).status !== 'disabled') {
      networkFeatures.push(
        new DisableableBladeFeature(
          this._translateService.instant(PortalResources.feature_pushNotificationsName),
          this._translateService.instant(PortalResources.feature_pushNotificationsName),
          this._translateService.instant(PortalResources.feature_pushNotificationsInfo),
          'image/push.svg',
          {
            detailBlade: 'PushRegistrationBlade',
            detailBladeInputs: { resourceUri: this._descriptor.resourceId },
          },
          this._portalService,
          this._hasSiteWritePermissionStream,
          this._scenarioService.checkScenario(ScenarioIds.enablePushNotifications, { site: site })
        )
      );
    }

    const monitoringFeatures = [
      new TabFeature(
        this._translateService.instant(PortalResources.feature_logStreamingName),
        this._translateService.instant(PortalResources.feature_logStreamingName) +
          ' ' +
          this._translateService.instant(PortalResources.feature_applicationLogsName) +
          ' ' +
          this._translateService.instant(PortalResources.feature_webServerLogsName),
        this._translateService.instant(PortalResources.feature_logStreamingInfo),
        'image/log-stream.svg',
        SiteTabIds.logStream,
        this._broadcastService
      ),

      new DisableableBladeFeature(
        this._translateService.instant(PortalResources.feature_processExplorerName),
        this._translateService.instant(PortalResources.feature_processExplorerName),
        this._translateService.instant(PortalResources.feature_processExplorerInfo),
        'image/process-explorer.svg',
        {
          detailBlade: 'ProcExpNewBlade',
          detailBladeInputs: { resourceUri: site.id },
        },
        this._portalService,
        this._hasSiteWritePermissionStream,
        this._scenarioService.checkScenario(ScenarioIds.enableProcessExplorer, { site: site })
      ),

      new DisableableBladeFeature(
        this._translateService.instant(PortalResources.feature_metricsName),
        this._translateService.instant(PortalResources.feature_metricsName),
        this._translateService.instant(PortalResources.feature_metricsInfo),
        'image/quotas.svg',
        {
          detailBlade: 'MetricsBladeV2',
          detailBladeInputs: {
            id: site.id,
          },
          extension: 'Microsoft_Azure_Monitoring',
        },
        this._portalService,
        null,
        this._scenarioService.checkScenario(ScenarioIds.enableMetrics, { site: site })
      ),
    ];

    // Instead of setting null in Features array, We are removing it here to minimize merge conflict
    // PLease remove it after merge from dev and fix properly with environmentswicther
    if (this._isOnprem()) {
      networkFeatures.splice(0, 1); // Networking
      networkFeatures.splice(3, 1); // push notification
      monitoringFeatures.splice(3, 1); // Security scanning
    }

    this.groups2 = [
      new FeatureGroup(this._translateService.instant(PortalResources.feature_networkingName), networkFeatures.filter(f => !!f)),
      new FeatureGroup(this._translateService.instant(PortalResources.feature_monitoring), monitoringFeatures.filter(f => !!f)),
    ];
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
          detailBladeInputs: { resourceUri: site.id },
        },
        this._portalService
      ),
    ];

    const appServicePlanFeatures = [
      new DisableableBladeFeature(
        this._translateService.instant(PortalResources.appServicePlan),
        this._translateService.instant(PortalResources.appServicePlan) + ' ' + this._translateService.instant(PortalResources.scale),
        this._translateService.instant(PortalResources.feature_appServicePlanInfo),
        'image/app-service-plan.svg',
        {
          detailBlade:
            this._scenarioService.checkScenario(ScenarioIds.openOldWebhostingPlanBlade).status === 'enabled'
              ? 'WebHostingPlanBlade'
              : 'PlansOverviewBlade',
          detailBladeInputs: { id: site.properties.serverFarmId },
        },
        this._portalService,
        this._hasPlanReadPermissionStream
      ),

      new DisableableTabFeature(
        this._translateService.instant(PortalResources.pricing_scaleUp),
        this._translateService.instant(PortalResources.pricing_scaleUp),
        this._translateService.instant(PortalResources.pricing_scaleUpDescription),
        'image/scale-up.svg',
        SiteTabIds.scaleUp,
        this._broadcastService,
        this._hasPlanWritePermissionStream,
        this._scenarioService.checkScenario(ScenarioIds.addScaleUp, { site: site })
      ),
    ];

    if (this._scenarioService.checkScenario(ScenarioIds.addSiteQuotas, { site: site }).status !== 'disabled') {
      appServicePlanFeatures.push(
        new DisableableBladeFeature(
          this._translateService.instant(PortalResources.feature_quotasName),
          this._translateService.instant(PortalResources.feature_quotasName),
          this._translateService.instant(PortalResources.feature_quotasInfo),
          'image/quotas.svg',
          {
            detailBlade: 'QuotasBlade',
            detailBladeInputs: {
              resourceUri: site.id,
            },
          },
          this._portalService,
          this._hasPlanReadPermissionStream
        )
      );
    }

    if (this._scenarioService.checkScenario(ScenarioIds.addSiteFileStorage, { site: site }).status !== 'disabled') {
      appServicePlanFeatures.push(
        new DisableableBladeFeature(
          this._translateService.instant(PortalResources.feature_quotasName),
          this._translateService.instant(PortalResources.feature_quotasName),
          this._translateService.instant(PortalResources.feature_quotasInfo),
          'image/quotas.svg',
          {
            detailBlade: 'FileSystemStorage',
            detailBladeInputs: {
              resourceUri: site.properties.serverFarmId,
            },
          },
          this._portalService,
          this._hasPlanReadPermissionStream
        )
      );
    }

    const resourceManagementFeatures = [];
    if (this._scenarioService.checkScenario(ScenarioIds.addDiagnoseAndSolve).status !== 'disabled') {
      resourceManagementFeatures.push(
        new DisableableBladeFeature(
          this._translateService.instant(PortalResources.feature_diagnoseAndSolveName),
          this._translateService.instant(PortalResources.feature_diagnoseAndSolveName),
          this._translateService.instant(PortalResources.feature_diagnoseAndSolveInfo),
          'image/tools.svg',
          {
            detailBlade: 'SCIFrameBlade',
            detailBladeInputs: {
              id: site.id,
            },
          },
          this._portalService,
          null,
          this._scenarioService.checkScenario(ScenarioIds.enableDiagnoseAndSolve, { site: site })
        )
      );
    }

    resourceManagementFeatures.push(
      new BladeFeature(
        this._translateService.instant(PortalResources.feature_activityLogName),
        this._translateService.instant(PortalResources.feature_activityLogName) +
          ' ' +
          this._translateService.instant(PortalResources.feature_activityLogName) +
          ' ' +
          this._translateService.instant(PortalResources.events),
        this._translateService.instant(PortalResources.feature_activityLogInfo),
        'image/activity-log.svg',
        {
          detailBlade: 'ActivityLogBlade',
          detailBladeInputs: {
            queryInputs: {
              id: site.id,
            },
          },
          extension: 'Microsoft_Azure_ActivityLog',
        },
        this._portalService
      )
    );

    resourceManagementFeatures.push(
      new BladeFeature(
        this._translateService.instant(PortalResources.feature_accessControlName),
        this._translateService.instant(PortalResources.feature_accessControlName) + ' rbac',
        this._translateService.instant(PortalResources.feature_accessControlInfo),
        'image/access-control.svg',
        {
          detailBlade: 'UserAssignmentsV2Blade',
          detailBladeInputs: {
            scope: site.id,
          },
          extension: 'Microsoft_Azure_AD',
        },
        this._portalService
      )
    );

    resourceManagementFeatures.push(
      new BladeFeature(
        this._translateService.instant(PortalResources.feature_tagsName),
        this._translateService.instant(PortalResources.feature_tagsName),
        this._translateService.instant(PortalResources.feature_tagsInfo),
        'image/tags.svg',
        {
          detailBlade: 'ResourceTagsListBlade',
          detailBladeInputs: {
            resourceId: site.id,
          },
          extension: 'HubsExtension',
        },
        this._portalService
      )
    );

    resourceManagementFeatures.push(
      new BladeFeature(
        this._translateService.instant(PortalResources.feature_locksName),
        this._translateService.instant(PortalResources.feature_locksName),
        this._translateService.instant(PortalResources.feature_locksInfo),
        'image/locks.svg',
        {
          detailBlade: 'LocksBlade',
          detailBladeInputs: {
            resourceId: site.id,
          },
          extension: 'HubsExtension',
        },
        this._portalService
      )
    );

    // new NotImplementedFeature('Clone app', 'clone app', 'Info'),  // TODO: [ehamai] - Need to implent

    resourceManagementFeatures.push(
      new BladeFeature(
        this._translateService.instant(PortalResources.feature_automationScriptName),
        this._translateService.instant(PortalResources.feature_automationScriptName) +
          ' ' +
          this._translateService.instant(PortalResources.template) +
          ' arm',
        this._translateService.instant(PortalResources.feature_automationScriptInfo),
        'image/automation-script.svg',
        {
          detailBlade: 'TemplateViewerBlade',
          detailBladeInputs: {
            options: {
              resourceGroup: `/subscriptions/${this._descriptor.subscription}/resourcegroups/${this._descriptor.resourceGroup}`,
              telemetryId: 'Microsoft.Web/sites',
            },
            stepOutput: null,
          },
          extension: 'HubsExtension',
        },
        this._portalService
      )
    );

    // new NotImplementedFeature(  // TODO: [ehamai] - Need to implement
    //     'New support request',
    //     'support request',
    //     'Info'),

    // Instead of setting null in Features array, We are removing it here to minimize merge conflict
    // PLease remove it after merge from dev and fix properly with environmentswicther
    if (this._isOnprem()) {
      resourceManagementFeatures.splice(4, 1); //Automation script
    }
    this.groups3 = [
      new FeatureGroup(this._translateService.instant(PortalResources.feature_api), apiManagementFeatures),
      new FeatureGroup(this._translateService.instant(PortalResources.appServicePlan), appServicePlanFeatures.filter(f => !!f)),
      new FeatureGroup(this._translateService.instant(PortalResources.feature_resourceManagement), resourceManagementFeatures),
    ];
  }

  private _getConsoleName(site: ArmObj<Site>): string {
    const console = this._translateService.instant(PortalResources.feature_consoleName);
    if (ArmUtil.isLinuxApp(site)) {
      const bashConsoleName = this._translateService.instant(PortalResources.feature_bashConsoleName);
      const sshConsoleName = this._translateService.instant(PortalResources.feature_sshConsoleName);
      return `${console} (${bashConsoleName} / ${sshConsoleName})`;
    }
    const cmdConsoleName = this._translateService.instant(PortalResources.feature_cmdConsoleName);
    const powershellConsoleName = this._translateService.instant(PortalResources.feature_powerShellConsoleName);
    return `${console} (${cmdConsoleName} / ${powershellConsoleName})`;
  }
}

export class OpenKuduFeature extends DisableableFeature {
  constructor(private _site: ArmObj<Site>, disableInfoStream: Subject<DisableInfo>, _translateService: TranslateService) {
    super(
      _translateService.instant(PortalResources.feature_advancedToolsName),
      _translateService.instant(PortalResources.feature_advancedToolsName) + ' kudu',
      _translateService.instant(PortalResources.feature_advancedToolsInfo),
      'image/advanced-tools.svg',
      disableInfoStream
    );
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
    scenarioService: ScenarioService
  ) {
    super(
      _translateService.instant(PortalResources.feature_appServiceEditorName),
      _translateService.instant(PortalResources.feature_appServiceEditorName),
      _translateService.instant(PortalResources.feature_appServiceEditorInfo),
      'image/appsvc-editor.svg',
      disabledInfoStream,
      scenarioService.checkScenario(ScenarioIds.enableAppServiceEditor, { site: _site })
    );
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
      'image/resource-explorer.svg'
    );
  }

  click() {
    window.open(`https://resources.azure.com${this._site.id}`);
  }
}

export class NotImplementedFeature extends FeatureItem {
  constructor(title: string, keywords: string, info: string) {
    super(title, keywords, info);
  }

  click() {
    alert('Not implemented');
  }
}
