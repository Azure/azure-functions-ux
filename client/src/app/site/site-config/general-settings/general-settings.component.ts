import { OsType } from './../../../shared/models/arm/stacks';
import { ConfigSaveComponent, ArmSaveConfigs } from 'app/shared/components/config-save-component';
import {
  Constants,
  Links,
  LogCategories,
  ScenarioIds,
  SiteTabIds,
  SubscriptionQuotaIds,
  WorkerRuntimeLanguages,
} from './../../../shared/models/constants';
import { PortalService } from './../../../shared/services/portal.service';
import { Component, Injector, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import { Site } from 'app/shared/models/arm/site';
import { SiteConfig } from 'app/shared/models/arm/site-config';
import { AvailableStack, AvailableStackNames, MajorVersion, LinuxConstants } from 'app/shared/models/arm/stacks';
import { DropDownElement, DropDownGroupElement } from './../../../shared/models/drop-down-element';
import { SelectOption } from './../../../shared/models/select-option';

import { LogService } from './../../../shared/services/log.service';
import { PortalResources } from './../../../shared/models/portal-resources';
import { CustomFormControl } from './../../../controls/click-to-edit/click-to-edit.component';
import { ArmObj, ArmArrayResult, ResourceId } from './../../../shared/models/arm/arm-obj';
import { AuthzService } from './../../../shared/services/authz.service';
import { ArmSiteDescriptor } from 'app/shared/resourceDescriptors';

import { JavaWebContainerProperties } from './models/java-webcontainer-properties';
import { ArmUtil } from 'app/shared/Utilities/arm-utils';
import { SiteService } from 'app/shared/services/site.service';
import { ScenarioService } from 'app/shared/services/scenario/scenario.service';
import { BillingService } from 'app/shared/services/billing.service';
import { HttpResult } from 'app/shared/models/http-result';
import { ApplicationSettings } from 'app/shared/models/arm/application-settings';
import { FunctionsVersionInfoHelper } from 'app/shared/models/functions-version-info';

@Component({
  selector: 'general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./../site-config.component.scss'],
})
export class GeneralSettingsComponent extends ConfigSaveComponent implements OnChanges, OnDestroy {
  @Input()
  mainForm: FormGroup;
  @Input()
  resourceId: ResourceId;

  public group: FormGroup;
  public hasWritePermissions: boolean;
  public permissionsMessage: string;
  public showPermissionsMessage: boolean;
  public showReadOnlySettingsMessage: string;
  public loadingFailureMessage: string;
  public loadingMessage: string;
  public FwLinks = Links;
  public isProductionSlot: boolean;
  public use32BitWorkerProcessUpsell: string;
  public alwaysOnUpsell: string;
  public autoSwapUpsell: string;
  public webSocketUpsell: string;
  public isDreamspark: boolean;

  public clientAffinityEnabledOptions: SelectOption<boolean>[];
  public use32BitWorkerProcessOptions: SelectOption<boolean>[];
  public webSocketsEnabledOptions: SelectOption<boolean>[];
  public alwaysOnOptions: SelectOption<boolean>[];
  public managedPipelineModeOptions: SelectOption<string>[];
  public remoteDebuggingEnabledOptions: SelectOption<boolean>[];
  public remoteDebuggingVersionOptions: SelectOption<string>[];
  public FTPAccessOptions: SelectOption<string>[];

  public netFrameworkSupported = false;
  public phpSupported = false;
  public pythonSupported = false;
  public javaSupported = false;
  public platform64BitSupported = false;
  public webSocketsSupported = false;
  public alwaysOnSupported = false;
  public classicPipelineModeSupported = false;
  public remoteDebuggingSupported = false;
  public useOldScaleUpBlade = false;
  public clientAffinitySupported = false;
  public FTPAccessSupported = false;

  public autoSwapSupported = false;
  public autoSwapEnabledOptions: SelectOption<boolean>[];

  public http20Supported = false;
  public http20EnabledOptions: SelectOption<boolean>[];

  public functionsSupportedJavaVersionDisplay: string;
  public isJavaFunctionApp = false;
  public showFunctionsJavaVersionUnspecifiedWarning = false;
  public showFunctionsJavaMinorVersionWarning = false;
  public dropDownOptionsMap: { [key: string]: DropDownElement<string>[] };
  public linuxRuntimeSupported = false;
  public linuxFxVersionOptions: DropDownGroupElement<string>[];
  public readonly linuxFxVersionLabelHelp: string;
  public readonly appCommandLineLabelHelp: string;

  private readonly _functionsSupportedJavaVersion = '1.8';
  private _sku: string;

  private _dropDownOptionsMapClean: { [key: string]: DropDownElement<string>[] };
  private _emptyJavaWebContainerProperties: JavaWebContainerProperties = {
    container: '',
    containerMajorVersion: '',
    containerMinorVersion: '',
  };
  private _javaMinorVersionOptionsMap: { [key: string]: DropDownElement<string>[] };
  private _javaMinorToMajorVersionsMap: { [key: string]: string };

  private _selectedJavaVersion: string;
  private _lastSelectedJavaWebContainer = JSON.stringify(this._emptyJavaWebContainerProperties);
  private _linuxFxVersionOptionsClean: DropDownGroupElement<string>[];
  private _ignoreChildEvents = true;

  constructor(
    private _fb: FormBuilder,
    private _translateService: TranslateService,
    private _logService: LogService,
    private _authZService: AuthzService,
    private _portalService: PortalService,
    private _siteService: SiteService,
    private _scenarioService: ScenarioService,
    private _billingService: BillingService,
    injector: Injector
  ) {
    super('GeneralSettingsComponent', injector, ['Site', 'SiteConfig'], SiteTabIds.applicationSettings);

    this.linuxFxVersionLabelHelp = this._translateService.instant(PortalResources.linuxFxVersionLabelHelp, {
      learnMoreLink: Links.linuxContainersLearnMore,
    });
    this.appCommandLineLabelHelp = this._translateService.instant(PortalResources.appCommandLineLabelHelp, {
      learnMoreLink: Links.linuxContainersLearnMore,
    });

    this._resetSlotsInfo();

    this._resetPermissionsAndLoadingState();

    this._generateRadioOptions();
  }

  protected get _isPristine() {
    return this.group && this.group.pristine;
  }

  protected setup(inputEvents: Observable<ResourceId>) {
    return inputEvents
      .distinctUntilChanged()
      .switchMap(() => {
        this._saveFailed = false;
        this._resetSubmittedStates();
        this._resetConfigs();
        this.group = null;
        this.dropDownOptionsMap = null;
        this._ignoreChildEvents = true;
        this._resetSlotsInfo();
        this._resetSupportedControls();
        this._resetPermissionsAndLoadingState();
        const subscription = new ArmSiteDescriptor(this.resourceId).subscription;

        return Observable.zip(
          this._siteService.getSite(this.resourceId),
          this._siteService.getSlots(this.resourceId),
          this._siteService.getSiteConfig(this.resourceId, true),
          this._siteService.getAppSettings(this.resourceId, true),
          this._siteService.getAvailableStacks(OsType.Windows),
          this._siteService.getAvailableStacks(OsType.Linux),
          this._authZService.hasPermission(this.resourceId, [AuthzService.writeScope]),
          this._authZService.hasReadOnlyLock(this.resourceId),
          this._scenarioService.checkScenarioAsync(ScenarioIds.enablePlatform64, { site: this.siteArm }),
          this._scenarioService.checkScenarioAsync(ScenarioIds.enableAlwaysOn, { site: this.siteArm }),
          this._scenarioService.checkScenarioAsync(ScenarioIds.enableAutoSwap, { site: this.siteArm }),
          this._scenarioService.checkScenarioAsync(ScenarioIds.webSocketsEnabled, { site: this.siteArm }),
          this._billingService.checkIfSubscriptionHasQuotaId(subscription, SubscriptionQuotaIds.dreamSparkQuotaId)
        );
      })
      .do(results => {
        const siteResult = results[0];
        const slotsResult = results[1];
        const configResult = results[2];
        const appSettingsResult = results[3];
        const stacksResultWindows = results[4];
        const stacksResultLinux = results[5];
        const hasWritePermission = results[6];
        const hasReadonlyLock = results[7];
        this.use32BitWorkerProcessUpsell = results[8].data;
        this.alwaysOnUpsell = results[9].data;
        this.autoSwapUpsell = results[10].data;
        this.webSocketUpsell = results[11].data;
        this.isDreamspark = results[12];

        if (!this._isFetchSuccessful(siteResult, slotsResult, configResult, appSettingsResult, stacksResultWindows, stacksResultWindows)) {
          this._setupForm(null, null);
          this.loadingFailureMessage = this._translateService.instant(PortalResources.configLoadFailure);
        } else {
          this.siteArm = siteResult.result;
          this.siteConfigArm = configResult.result;
          this.appSettingsArm = appSettingsResult.isSuccessful && appSettingsResult.result;

          this._sku = this.siteArm.properties.sku;

          this.isJavaFunctionApp = this._isJavaFunctionApp(this.siteArm, this.appSettingsArm);

          this._setPermissions(hasWritePermission, hasReadonlyLock);

          if (!this._dropDownOptionsMapClean) {
            this._parseAvailableStacks(stacksResultWindows.result);
            this._parseSlotsConfig(slotsResult.result);
          }
          if (!this._linuxFxVersionOptionsClean) {
            this._parseLinuxBuiltInStacks(stacksResultLinux.result);
          }

          this._processSupportedControls(this.siteArm, this.siteConfigArm);
          this._setupForm(this.siteConfigArm, this.siteArm);
        }

        this.loadingMessage = null;
        this.showPermissionsMessage = true;
      });
  }

  private _isJavaFunctionApp(siteArm: ArmObj<Site>, appSettingsArm: ArmObj<ApplicationSettings>): boolean {
    if (!siteArm || !ArmUtil.isFunctionApp(siteArm) || !appSettingsArm || !appSettingsArm.properties) {
      return false;
    }

    const runtimeVersion = appSettingsArm.properties[Constants.runtimeVersionAppSettingName];
    const runtimeGeneration = FunctionsVersionInfoHelper.getFunctionGeneration(runtimeVersion);
    const workerRuntime = appSettingsArm.properties[Constants.functionsWorkerRuntimeAppSettingsName];
    return runtimeGeneration === 'V2' && workerRuntime === WorkerRuntimeLanguages.java.toLowerCase();
  }

  private _isFetchSuccessful(
    siteResult: HttpResult<ArmObj<Site>>,
    slotsResult: HttpResult<ArmArrayResult<Site>>,
    configResult: HttpResult<ArmObj<SiteConfig>>,
    appSettingsResult: HttpResult<ArmObj<ApplicationSettings>>,
    stacksResultWindows: HttpResult<ArmArrayResult<AvailableStack>>,
    stacksResultLinux: HttpResult<ArmArrayResult<AvailableStack>>
  ): boolean {
    let isSuccessful = true;

    if (!siteResult.isSuccessful) {
      this._logService.error(LogCategories.generalSettings, '/general-settings', siteResult.error.result);
      isSuccessful = false;
    }
    if (!slotsResult.isSuccessful) {
      this._logService.error(LogCategories.generalSettings, '/general-settings', slotsResult.error.result);
      isSuccessful = false;
    }
    if (!configResult.isSuccessful) {
      this._logService.error(LogCategories.generalSettings, '/general-settings', configResult.error.result);
      isSuccessful = false;
    }
    if (!appSettingsResult.isSuccessful) {
      this._logService.error(LogCategories.generalSettings, '/general-settings', appSettingsResult.error.result);
    }
    if (!stacksResultWindows.isSuccessful) {
      this._logService.error(LogCategories.generalSettings, '/general-settings', stacksResultWindows.error.result);
      isSuccessful = false;
    }
    if (!stacksResultLinux.isSuccessful) {
      this._logService.error(LogCategories.generalSettings, '/general-settings', stacksResultLinux.error.result);
      isSuccessful = false;
    }

    return isSuccessful;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['resourceId']) {
      this.setInput(this.resourceId);
    }
    if (changes['mainForm'] && !changes['resourceId']) {
      this._setupForm(this.siteConfigArm, this.siteArm);
    }
  }

  scaleUp() {
    this.setBusy();
    if (!this.useOldScaleUpBlade) {
      this._portalService
        .openFrameBlade(
          {
            detailBlade: 'SpecPickerFrameBlade',
            detailBladeInputs: {
              id: this.siteArm.properties.serverFarmId,
              feature: 'scaleup',
              data: null,
            },
          },
          this.componentName
        )
        .subscribe(r => {
          this.clearBusy();
          this._logService.debug(LogCategories.siteConfig, `Scale up ${r.reason === 'childClosedSelf' ? 'succeeded' : 'cancelled'}`);
        });
    } else {
      const inputs = {
        aspResourceId: this.siteArm.properties.serverFarmId,
        aseResourceId: this.siteArm.properties.hostingEnvironmentProfile && this.siteArm.properties.hostingEnvironmentProfile.id,
      };

      const openScaleUpBlade = this._portalService.openCollectorBladeWithInputs('', inputs, 'site-manage', null, 'WebsiteSpecPickerV3');

      openScaleUpBlade.first().subscribe(
        r => {
          this.clearBusy();
          this._logService.debug(LogCategories.siteConfig, `Scale up ${r ? 'succeeded' : 'cancelled'}`);
        },
        e => {
          this.clearBusy();
          this._logService.error(LogCategories.siteConfig, '/scale-up', `Scale up failed: ${e}`);
        }
      );
    }
  }

  private _resetSlotsInfo() {
    this.isProductionSlot = true;

    if (this.resourceId) {
      const siteDescriptor = new ArmSiteDescriptor(this.resourceId);
      this.isProductionSlot = !siteDescriptor.slot;
    }
  }

  private _resetPermissionsAndLoadingState() {
    this.hasWritePermissions = true;
    this.permissionsMessage = '';
    this.showPermissionsMessage = false;
    this.showReadOnlySettingsMessage = this._translateService.instant(PortalResources.configViewReadOnlySettings);
    this.loadingFailureMessage = '';
    this.loadingMessage = this._translateService.instant(PortalResources.loading);
  }

  private _setPermissions(writePermission: boolean, readOnlyLock: boolean) {
    if (!writePermission) {
      this.permissionsMessage = this._translateService.instant(PortalResources.configRequiresWritePermissionOnApp);
    } else if (readOnlyLock) {
      this.permissionsMessage = this._translateService.instant(PortalResources.configDisabledReadOnlyLockOnApp);
    } else {
      this.permissionsMessage = '';
    }

    this.hasWritePermissions = writePermission && !readOnlyLock;
  }

  private _resetSupportedControls() {
    this.netFrameworkSupported = false;
    this.phpSupported = false;
    this.pythonSupported = false;
    this.javaSupported = false;
    this.platform64BitSupported = false;
    this.webSocketsSupported = false;
    this.alwaysOnSupported = false;
    this.classicPipelineModeSupported = false;
    this.remoteDebuggingSupported = false;
    this.useOldScaleUpBlade = false;
    this.clientAffinitySupported = false;
    this.autoSwapSupported = false;
    this.linuxRuntimeSupported = false;
    this.FTPAccessSupported = false;
    this.http20Supported = false;
  }

  private _processSupportedControls(siteArm: ArmObj<Site>, siteConfigArm: ArmObj<SiteConfig>) {
    if (!!siteArm) {
      let netFrameworkSupported = true;
      let phpSupported = true;
      let pythonSupported = true;
      let javaSupported = true;
      let platform64BitSupported = true;
      let webSocketsSupported = true;
      let alwaysOnSupported = true;
      let classicPipelineModeSupported = true;
      let remoteDebuggingSupported = true;
      let useOldScaleUpBlade = false;
      let clientAffinitySupported = true;
      let autoSwapSupported = true;
      let linuxRuntimeSupported = false;
      let FTPAccessSupported = true;
      let http20Supported = true;

      if (ArmUtil.isLinuxApp(siteArm)) {
        netFrameworkSupported = false;
        phpSupported = false;
        pythonSupported = false;
        javaSupported = false;
        platform64BitSupported = false;
        webSocketsSupported = false;
        classicPipelineModeSupported = false;
        remoteDebuggingSupported = false;

        const linuxFxVersion = siteConfigArm.properties.linuxFxVersion || '';
        if (
          linuxFxVersion.indexOf(LinuxConstants.dockerPrefix) === -1 &&
          linuxFxVersion.indexOf(LinuxConstants.composePrefix) === -1 &&
          linuxFxVersion.indexOf(LinuxConstants.kubernetesPrefix) === -1
        ) {
          linuxRuntimeSupported = true;
        }

        autoSwapSupported = false;
      }

      if (ArmUtil.isFunctionApp(siteArm)) {
        netFrameworkSupported = false;
        pythonSupported = false;
        javaSupported = false; // TODO (andimarc): Set to "this.isJavaFunctionApp" once ANT79 is fully deployed
        classicPipelineModeSupported = false;
        linuxRuntimeSupported = false;

        if (this._sku === 'Dynamic') {
          webSocketsSupported = false;
          clientAffinitySupported = false;
        }
      }

      if (
        this.isDreamspark ||
        this._scenarioService.checkScenario(ScenarioIds.alwaysOnSupported, { site: siteArm }).status === 'disabled'
      ) {
        alwaysOnSupported = false;
      }

      if (this._scenarioService.checkScenario(ScenarioIds.addFTPOptions, { site: siteArm }).status === 'disabled') {
        FTPAccessSupported = false;
      }

      if (this._scenarioService.checkScenario(ScenarioIds.addHTTPSwitch, { site: siteArm }).status === 'disabled') {
        http20Supported = false;
      }

      if (this._scenarioService.checkScenario(ScenarioIds.dotNetFrameworkSupported, { site: siteArm }).status === 'disabled') {
        netFrameworkSupported = false;
      }

      if (this._scenarioService.checkScenario(ScenarioIds.platform64BitSupported, { site: siteArm }).status === 'disabled') {
        platform64BitSupported = false;
      }

      if (this._scenarioService.checkScenario(ScenarioIds.webSocketsSupported, { site: siteArm }).status === 'disabled') {
        webSocketsSupported = false;
      }

      if (this._scenarioService.checkScenario(ScenarioIds.classicPipelineModeSupported, { site: siteArm }).status === 'disabled') {
        classicPipelineModeSupported = false;
      }

      if (this._scenarioService.checkScenario(ScenarioIds.remoteDebuggingSupported, { site: siteArm }).status === 'disabled') {
        remoteDebuggingSupported = false;
      }

      if (this._scenarioService.checkScenario(ScenarioIds.useOldScaleUpBlade, { site: siteArm }).status === 'enabled') {
        useOldScaleUpBlade = true;
      }

      if (this._scenarioService.checkScenario(ScenarioIds.phpSupported, { site: siteArm }).status === 'disabled') {
        phpSupported = false;
      }

      if (this._scenarioService.checkScenario(ScenarioIds.pythonSupported, { site: siteArm }).status === 'disabled') {
        pythonSupported = false;
      }

      if (this._scenarioService.checkScenario(ScenarioIds.javaSupported, { site: siteArm }).status === 'disabled') {
        javaSupported = false;
      }

      if (this._scenarioService.checkScenario(ScenarioIds.autoSwapSupported, { site: siteArm }).status === 'disabled') {
        autoSwapSupported = false;
      }

      this.netFrameworkSupported = netFrameworkSupported;
      this.phpSupported = phpSupported;
      this.pythonSupported = pythonSupported;
      this.javaSupported = javaSupported;
      this.platform64BitSupported = platform64BitSupported;
      this.webSocketsSupported = webSocketsSupported;
      this.alwaysOnSupported = alwaysOnSupported;
      this.classicPipelineModeSupported = classicPipelineModeSupported;
      this.remoteDebuggingSupported = remoteDebuggingSupported;
      this.useOldScaleUpBlade = useOldScaleUpBlade;
      this.clientAffinitySupported = clientAffinitySupported;
      this.autoSwapSupported = autoSwapSupported;
      this.linuxRuntimeSupported = linuxRuntimeSupported;
      this.FTPAccessSupported = FTPAccessSupported;
      this.http20Supported = http20Supported;
    }
  }

  private _setupForm(siteConfigArm: ArmObj<SiteConfig>, siteArm: ArmObj<Site>) {
    if (!!siteConfigArm && !!siteArm) {
      this._ignoreChildEvents = true;

      if (!this._saveFailed || !this.group) {
        const group = this._fb.group({});
        const dropDownOptionsMap: { [key: string]: DropDownElement<string>[] } = {};
        const linuxFxVersionOptions: DropDownGroupElement<string>[] = [];

        this._setupNetFramworkVersion(group, dropDownOptionsMap, siteConfigArm.properties.netFrameworkVersion);
        this._setupPhpVersion(group, dropDownOptionsMap, siteConfigArm.properties.phpVersion);
        this._setupPythonVersion(group, dropDownOptionsMap, siteConfigArm.properties.pythonVersion);
        this._setupJava(
          group,
          dropDownOptionsMap,
          siteConfigArm.properties.javaVersion,
          siteConfigArm.properties.javaContainer,
          siteConfigArm.properties.javaContainerVersion
        );
        this._setupGeneralSettings(group, siteConfigArm, siteArm);
        this._setupAutoSwapSettings(group, dropDownOptionsMap, siteConfigArm.properties.autoSwapSlotName);
        this._setupLinux(group, linuxFxVersionOptions, siteConfigArm.properties.linuxFxVersion, siteConfigArm.properties.appCommandLine);

        this.group = group;
        this.dropDownOptionsMap = dropDownOptionsMap;
        this.linuxFxVersionOptions = linuxFxVersionOptions;
      }

      if (this.mainForm.contains('generalSettings')) {
        this.mainForm.setControl('generalSettings', this.group);
      } else {
        this.mainForm.addControl('generalSettings', this.group);
      }

      setTimeout(() => {
        this._ignoreChildEvents = false;
      }, 0);

      setTimeout(() => {
        this._setEnabledStackControls();
      }, 0);
    } else {
      this.group = null;
      this.dropDownOptionsMap = null;

      if (this.mainForm.contains('generalSettings')) {
        this.mainForm.removeControl('generalSettings');
      }
    }

    this._saveFailed = null;
    this._resetSubmittedStates();
  }

  private _setControlsEnabledState(names: string[], enabled: boolean) {
    if (!!this.group && !!names) {
      names.forEach(name => {
        if (!!this.group.controls[name]) {
          if (enabled) {
            this.group.controls[name].enable();
          } else {
            this.group.controls[name].disable();
          }
        }
      });
    }
  }

  private _setEnabledStackControls() {
    this._setControlsEnabledState(['netFrameworkVersion'], !this._selectedJavaVersion && this.hasWritePermissions);
    if (this.phpSupported) {
      this._setControlsEnabledState(['phpVersion'], !this._selectedJavaVersion && this.hasWritePermissions);
    }
    if (this.pythonSupported) {
      this._setControlsEnabledState(['pythonVersion'], !this._selectedJavaVersion && this.hasWritePermissions);
    }
    if (this.javaSupported) {
      this._setControlsEnabledState(['javaVersion'], true && this.hasWritePermissions);
      this._setControlsEnabledState(['javaMinorVersion', 'javaWebContainer'], !!this._selectedJavaVersion && this.hasWritePermissions);
    }
  }

  private _getSupportedRemoteDebuggingVersionOptions(): SelectOption<string>[] {
    return [{ displayLabel: '2015', value: 'VS2015' }, { displayLabel: '2017', value: 'VS2017' }];
  }

  private _generateRadioOptions() {
    const onString = this._translateService.instant(PortalResources.on);
    const offString = this._translateService.instant(PortalResources.off);

    this.clientAffinityEnabledOptions = [{ displayLabel: offString, value: false }, { displayLabel: onString, value: true }];

    this.use32BitWorkerProcessOptions = [
      { displayLabel: this._translateService.instant(PortalResources.architecture32), value: true },
      { displayLabel: this._translateService.instant(PortalResources.architecture64), value: false },
    ];

    this.webSocketsEnabledOptions = [{ displayLabel: offString, value: false }, { displayLabel: onString, value: true }];

    this.alwaysOnOptions = [{ displayLabel: offString, value: false }, { displayLabel: onString, value: true }];

    this.managedPipelineModeOptions = [
      { displayLabel: this._translateService.instant(PortalResources.pipelineModeIntegrated), value: 'Integrated' },
      { displayLabel: this._translateService.instant(PortalResources.pipelineModeClassic), value: 'Classic' },
    ];

    this.remoteDebuggingEnabledOptions = [{ displayLabel: offString, value: false }, { displayLabel: onString, value: true }];

    this.remoteDebuggingVersionOptions = this._getSupportedRemoteDebuggingVersionOptions();

    this.autoSwapEnabledOptions = [{ displayLabel: offString, value: false }, { displayLabel: onString, value: true }];

    this.FTPAccessOptions = [
      { displayLabel: this._translateService.instant(PortalResources.FTPBoth), value: 'AllAllowed' },
      { displayLabel: this._translateService.instant(PortalResources.FTPSOnly), value: 'FtpsOnly' },
      { displayLabel: this._translateService.instant(PortalResources.FTPDisable), value: 'Disabled' },
    ];

    this.http20EnabledOptions = [{ displayLabel: '1.1', value: false }, { displayLabel: '2.0', value: true }];
  }

  private _adjustRemoteDebuggingVersionOptions(remoteDebuggingVersion: string) {
    const remoteDebuggingVersionOptions = this._getSupportedRemoteDebuggingVersionOptions();
    if (remoteDebuggingVersion === 'VS2012' || remoteDebuggingVersion === 'VS2013') {
      remoteDebuggingVersionOptions.unshift({
        displayLabel: remoteDebuggingVersion.substr(2),
        value: remoteDebuggingVersion,
      });
    }
    this.remoteDebuggingVersionOptions = remoteDebuggingVersionOptions;
  }

  private _setupGeneralSettings(group: FormGroup, siteConfigArm: ArmObj<SiteConfig>, siteArm: ArmObj<Site>) {
    if (this.platform64BitSupported) {
      group.addControl(
        'use32BitWorkerProcess',
        this._fb.control({ value: siteConfigArm.properties.use32BitWorkerProcess, disabled: !this.hasWritePermissions })
      );
    }
    if (this.webSocketsSupported) {
      group.addControl(
        'webSocketsEnabled',
        this._fb.control({ value: siteConfigArm.properties.webSocketsEnabled, disabled: !this.hasWritePermissions })
      );
    }
    if (this.alwaysOnSupported) {
      group.addControl('alwaysOn', this._fb.control({ value: siteConfigArm.properties.alwaysOn, disabled: !this.hasWritePermissions }));
    }
    if (this.classicPipelineModeSupported) {
      group.addControl(
        'managedPipelineMode',
        this._fb.control({ value: siteConfigArm.properties.managedPipelineMode, disabled: !this.hasWritePermissions })
      );
    }
    if (this.clientAffinitySupported) {
      group.addControl(
        'clientAffinityEnabled',
        this._fb.control({ value: siteArm.properties.clientAffinityEnabled, disabled: !this.hasWritePermissions })
      );
    }
    if (this.remoteDebuggingSupported) {
      this._adjustRemoteDebuggingVersionOptions(siteConfigArm.properties.remoteDebuggingVersion);
      group.addControl(
        'remoteDebuggingEnabled',
        this._fb.control({ value: siteConfigArm.properties.remoteDebuggingEnabled, disabled: !this.hasWritePermissions })
      );
      group.addControl(
        'remoteDebuggingVersion',
        this._fb.control({ value: siteConfigArm.properties.remoteDebuggingVersion, disabled: !this.hasWritePermissions })
      );
      setTimeout(() => {
        this._setControlsEnabledState(
          ['remoteDebuggingVersion'],
          siteConfigArm.properties.remoteDebuggingEnabled && this.hasWritePermissions
        );
      }, 0);
    }
    if (this.FTPAccessSupported) {
      group.addControl(
        'FTPAccessOptions',
        this._fb.control({ value: siteConfigArm.properties.ftpsState, disabled: !this.hasWritePermissions })
      );
    }
    if (this.http20Supported) {
      group.addControl(
        'http20Enabled',
        this._fb.control({ value: siteConfigArm.properties.http20Enabled, disabled: !this.hasWritePermissions })
      );
    }
  }

  public updateRemoteDebuggingVersionOptions(enabled: boolean) {
    if (!this._ignoreChildEvents) {
      this._setControlsEnabledState(['remoteDebuggingVersion'], enabled && this.hasWritePermissions);
    }
  }

  private _setupAutoSwapSettings(
    group: FormGroup,
    dropDownOptionsMap: { [key: string]: DropDownElement<string>[] },
    autoSwapSlotName: string
  ) {
    if (this.autoSwapSupported) {
      const autoSwapEnabledControlInfo = { value: false, disabled: true };
      const autoSwapSlotNameControlInfo = { value: '', disabled: true };

      const autoSwapSlotNameOptions: DropDownElement<string>[] = [];
      const autoSwapSlotNameOptionsClean = this._dropDownOptionsMapClean['autoSwapSlotName'];

      if (!this.isProductionSlot && autoSwapSlotNameOptionsClean.length > 0) {
        autoSwapEnabledControlInfo.disabled = false;

        // We only show Auto Swap as "On" if the autoSwapSlotName config property is set and the configured value appears in the list of slot names.
        if (autoSwapSlotName) {
          let foundIndex = autoSwapSlotNameOptionsClean.findIndex(n => n.value === autoSwapSlotName);
          if (foundIndex !== -1) {
            autoSwapEnabledControlInfo.value = true;
            autoSwapSlotNameControlInfo.value = autoSwapSlotName;
            autoSwapSlotNameControlInfo.disabled = false;

            autoSwapSlotNameOptionsClean.forEach((element, index) => {
              autoSwapSlotNameOptions.push({
                displayLabel: element.displayLabel,
                value: element.value,
                default: index === foundIndex,
              });
            });
          }
        }
      }

      autoSwapEnabledControlInfo.disabled = autoSwapEnabledControlInfo.disabled || !this.hasWritePermissions;
      autoSwapSlotNameControlInfo.disabled = autoSwapSlotNameControlInfo.disabled || !this.hasWritePermissions;

      group.addControl(
        'autoSwapEnabled',
        this._fb.control({ value: autoSwapEnabledControlInfo.value, disabled: autoSwapEnabledControlInfo.disabled })
      );
      group.addControl(
        'autoSwapSlotName',
        this._fb.control({ value: autoSwapSlotNameControlInfo.value, disabled: autoSwapSlotNameControlInfo.disabled })
      );

      dropDownOptionsMap['autoSwapSlotName'] = autoSwapSlotNameOptions;

      setTimeout(() => {
        this._setControlsEnabledState(['autoSwapEnabled'], !autoSwapEnabledControlInfo.disabled);
        this._setControlsEnabledState(['autoSwapSlotName'], !autoSwapSlotNameControlInfo.disabled);
      }, 0);
    }
  }

  public updateAutoSwapSlotNameOptions(enabled: boolean) {
    if (!this._ignoreChildEvents) {
      let autoSwapSlotNameOptions: DropDownElement<string>[] = [];
      let autoSwapSlotName = '';

      if (enabled) {
        const autoSwapSlotNameOptionsClean = this._dropDownOptionsMapClean['autoSwapSlotName'];
        autoSwapSlotNameOptions = JSON.parse(JSON.stringify(autoSwapSlotNameOptionsClean));
        autoSwapSlotNameOptions[0].default = true;
        autoSwapSlotName = autoSwapSlotNameOptions[0].value;
      }

      const autoSwapSlotNameControl = this._fb.control({ value: autoSwapSlotName, disabled: !enabled || !this.hasWritePermissions });

      if (!!this.group.controls['autoSwapSlotName']) {
        this.group.setControl('autoSwapSlotName', autoSwapSlotNameControl);
      } else {
        this.group.addControl('autoSwapSlotName', autoSwapSlotNameControl);
      }

      if (enabled || this.group.controls['autoSwapEnabled'].dirty) {
        this.group.controls['autoSwapSlotName'].markAsDirty();
      }

      this._setDropDownOptions('autoSwapSlotName', autoSwapSlotNameOptions);

      setTimeout(() => {
        this._setControlsEnabledState(['autoSwapSlotName'], enabled && this.hasWritePermissions);
      }, 0);
    }
  }

  private _parseSlotsConfig(slotsConfigArm: ArmArrayResult<Site>) {
    this._dropDownOptionsMapClean = this._dropDownOptionsMapClean || {};

    const autoSwapSlotNameOptions: DropDownElement<string>[] = [];

    if (!this.isProductionSlot) {
      const prodSlotDisplayName = this._translateService.instant(PortalResources.productionSlotDisplayName);
      autoSwapSlotNameOptions.push({ displayLabel: prodSlotDisplayName, value: 'production', default: false });
      if (slotsConfigArm && slotsConfigArm.value) {
        slotsConfigArm.value
          .filter(s => s.name !== this.siteArm.name)
          .map(s => s.name.split('/').slice(-1)[0])
          .forEach(n => autoSwapSlotNameOptions.push({ displayLabel: n, value: n, default: false }));
      }
    }

    this._dropDownOptionsMapClean['autoSwapSlotName'] = autoSwapSlotNameOptions;
  }

  private _setDropDownOptions(name: string, options: DropDownElement<string>[]) {
    this.dropDownOptionsMap = this.dropDownOptionsMap || {};
    this.dropDownOptionsMap[name] = options;
  }

  private _setupNetFramworkVersion(
    group: FormGroup,
    dropDownOptionsMap: { [key: string]: DropDownElement<string>[] },
    netFrameworkVersion: string
  ) {
    if (this.netFrameworkSupported) {
      let defaultValue = '';

      const netFrameworkVersionOptions: DropDownElement<string>[] = [];
      const netFrameworkVersionOptionsClean = this._dropDownOptionsMapClean[AvailableStackNames.NetStack];

      netFrameworkVersionOptionsClean.forEach(element => {
        const match = element.value === netFrameworkVersion || (!element.value && !netFrameworkVersion);
        defaultValue = match ? element.value : defaultValue;

        netFrameworkVersionOptions.push({
          displayLabel: element.displayLabel,
          value: element.value,
          default: match,
        });
      });

      const netFrameworkVersionControl = this._fb.control({ value: defaultValue, disabled: !this.hasWritePermissions });
      group.addControl('netFrameworkVersion', netFrameworkVersionControl);

      dropDownOptionsMap['netFrameworkVersion'] = netFrameworkVersionOptions;
    }
  }

  private _setupPhpVersion(group: FormGroup, dropDownOptionsMap: { [key: string]: DropDownElement<string>[] }, phpVersion: string) {
    if (this.phpSupported) {
      let defaultValue = '';

      const phpVersionOptions: DropDownElement<string>[] = [];
      const phpVersionOptionsClean = this._dropDownOptionsMapClean[AvailableStackNames.PhpStack];

      phpVersionOptionsClean.forEach(element => {
        const match = element.value === phpVersion || (!element.value && !phpVersion);
        defaultValue = match ? element.value : defaultValue;

        phpVersionOptions.push({
          displayLabel: element.displayLabel,
          value: element.value,
          default: match,
        });
      });

      const phpVersionControl = this._fb.control({ value: defaultValue, disabled: !this.hasWritePermissions });
      group.addControl('phpVersion', phpVersionControl);

      dropDownOptionsMap['phpVersion'] = phpVersionOptions;
    }
  }

  private _setupPythonVersion(group: FormGroup, dropDownOptionsMap: { [key: string]: DropDownElement<string>[] }, pythonVersion: string) {
    if (this.pythonSupported) {
      let defaultValue = '';

      const pythonVersionOptions: DropDownElement<string>[] = [];
      const pythonVersionOptionsClean = this._dropDownOptionsMapClean[AvailableStackNames.PythonStack];

      pythonVersionOptionsClean.forEach(element => {
        const match = element.value === pythonVersion || (!element.value && !pythonVersion);
        defaultValue = match ? element.value : defaultValue;

        pythonVersionOptions.push({
          displayLabel: element.displayLabel,
          value: element.value,
          default: match,
        });
      });

      const pythonVersionControl = this._fb.control({ value: defaultValue, disabled: !this.hasWritePermissions });
      group.addControl('pythonVersion', pythonVersionControl);

      dropDownOptionsMap['pythonVersion'] = pythonVersionOptions;
    }
  }

  private _setupJava(
    group: FormGroup,
    dropDownOptionsMap: { [key: string]: DropDownElement<string>[] },
    javaVersion: string,
    javaContainer: string,
    javaContainerVersion: string
  ) {
    if (this.javaSupported) {
      let defaultJavaMinorVersion = '';
      let javaMinorVersionOptions: DropDownElement<string>[] = [];

      let defaultJavaVersion = '';
      const javaVersionOptions: DropDownElement<string>[] = [];
      const javaVersionOptionsClean = this.isJavaFunctionApp
        ? this._dropDownOptionsMapClean[AvailableStackNames.JavaStackForFunctions]
        : this._dropDownOptionsMapClean[AvailableStackNames.JavaStack];

      if (javaVersion) {
        if (this._javaMinorVersionOptionsMap[javaVersion]) {
          defaultJavaVersion = javaVersion;
        } else if (this._javaMinorToMajorVersionsMap[javaVersion]) {
          defaultJavaVersion = this._javaMinorToMajorVersionsMap[javaVersion];
          defaultJavaMinorVersion = javaVersion;
        } else {
          // TODO (andimarc): How to handle an invalid javaVersion string
          defaultJavaVersion = '';
          defaultJavaMinorVersion = '';
        }
      }

      this._updateFunctionsJavaWarnings(defaultJavaVersion, defaultJavaMinorVersion);

      if (this.isJavaFunctionApp && !!defaultJavaVersion && defaultJavaVersion !== this._functionsSupportedJavaVersion) {
        // TODO (andimarc): How to handle function app using unsupported java version
        defaultJavaVersion = '';
        defaultJavaMinorVersion = '';
      }

      // MajorVersion
      this._selectedJavaVersion = defaultJavaVersion;
      javaVersionOptionsClean.forEach(element => {
        // For a Java Function app, don't include the 'empty' option unless the setting is currently not configured on the app
        const shouldExclude = this.isJavaFunctionApp && !element.value && !!defaultJavaVersion;
        if (!shouldExclude) {
          javaVersionOptions.push({
            displayLabel: element.displayLabel,
            value: element.value,
            default: element.value === defaultJavaVersion || (!element.value && !defaultJavaVersion),
          });
        }
      });
      const javaVersionControl = this._fb.control({ value: defaultJavaVersion, disabled: !this.hasWritePermissions });

      // MinorVersion
      if (defaultJavaVersion) {
        this._javaMinorVersionOptionsMap[defaultJavaVersion].forEach(element => {
          javaMinorVersionOptions.push({
            displayLabel: element.displayLabel,
            value: element.value,
            default: element.value === defaultJavaMinorVersion || (!element.value && !defaultJavaMinorVersion),
          });
        });
      } else {
        javaMinorVersionOptions = [];
      }
      const javaMinorVersionControl = this._fb.control({ value: defaultJavaMinorVersion, disabled: !this.hasWritePermissions });

      // WebContainer
      let defaultJavaWebContainer = JSON.stringify(this._emptyJavaWebContainerProperties);
      const javaWebContainerOptions: DropDownElement<string>[] = [];

      if (defaultJavaVersion) {
        const javaWebContainerOptionsClean = this._dropDownOptionsMapClean[AvailableStackNames.JavaContainer];

        javaWebContainerOptionsClean.forEach(element => {
          let match = false;
          const parsedValue: JavaWebContainerProperties = JSON.parse(element.value);
          if (!javaContainer && !javaContainerVersion && element.value === JSON.stringify(this._emptyJavaWebContainerProperties)) {
            defaultJavaWebContainer = element.value;
            match = true;
          } else if (
            parsedValue.container.toUpperCase() === javaContainer &&
            (parsedValue.containerMinorVersion === javaContainerVersion ||
              (parsedValue.containerMajorVersion === javaContainerVersion && !parsedValue.containerMinorVersion))
          ) {
            defaultJavaWebContainer = element.value;
            match = true;
          }
          javaWebContainerOptions.push({
            displayLabel: element.displayLabel,
            value: element.value,
            default: match,
          });
        });
      }

      this._lastSelectedJavaWebContainer = defaultJavaWebContainer;
      const javaWebContainerControl = this._fb.control({ value: defaultJavaWebContainer, disabled: !this.hasWritePermissions });

      group.addControl('javaVersion', javaVersionControl);
      group.addControl('javaMinorVersion', javaMinorVersionControl);
      group.addControl('javaWebContainer', javaWebContainerControl);

      dropDownOptionsMap['javaVersion'] = javaVersionOptions;
      dropDownOptionsMap['javaMinorVersion'] = javaMinorVersionOptions;
      dropDownOptionsMap['javaWebContainer'] = javaWebContainerOptions;
    }
  }

  public updateJavaOptions(javaVersion: string) {
    const previousJavaVersionSelection = this._selectedJavaVersion;
    this._selectedJavaVersion = javaVersion;

    if (!this._ignoreChildEvents) {
      let javaMinorVersionOptions: DropDownElement<string>[];
      let defaultJavaMinorVersion: string;
      let javaMinorVersionNeedsUpdate = false;

      let javaWebContainerOptions: DropDownElement<string>[];
      let defaultJavaWebContainer: string;
      let javaWebContainerNeedsUpdate = false;

      if (!javaVersion) {
        if (!!previousJavaVersionSelection) {
          javaMinorVersionOptions = [];
          defaultJavaMinorVersion = '';
          javaMinorVersionNeedsUpdate = true;

          this._lastSelectedJavaWebContainer = this.group.controls['javaWebContainer'].value as string;
          javaWebContainerOptions = [];
          defaultJavaWebContainer = JSON.stringify(this._emptyJavaWebContainerProperties);
          javaWebContainerNeedsUpdate = true;
        }
      } else {
        const javaMinorVersionOptionsClean = this._javaMinorVersionOptionsMap[javaVersion] || [];
        javaMinorVersionOptions = JSON.parse(JSON.stringify(javaMinorVersionOptionsClean));
        javaMinorVersionOptions.forEach(element => {
          element.default = !element.value;
        });
        defaultJavaMinorVersion = '';
        javaMinorVersionNeedsUpdate = true;

        if (!previousJavaVersionSelection) {
          defaultJavaWebContainer = this._lastSelectedJavaWebContainer;
          const javaWebContainerOptionsClean = this._dropDownOptionsMapClean[AvailableStackNames.JavaContainer];
          javaWebContainerOptions = JSON.parse(JSON.stringify(javaWebContainerOptionsClean));
          javaWebContainerOptions.forEach(option => {
            option.default = option.value === defaultJavaWebContainer;
          });
          javaWebContainerNeedsUpdate = true;
        }
      }

      this._updateFunctionsJavaWarnings(javaVersion, defaultJavaMinorVersion);

      // MinorVersion
      if (javaMinorVersionNeedsUpdate) {
        const javaMinorVersionControl = this._fb.control({ value: defaultJavaMinorVersion, disabled: !this.hasWritePermissions });

        if (!!this.group.controls['javaMinorVersion']) {
          this.group.setControl('javaMinorVersion', javaMinorVersionControl);
        } else {
          this.group.addControl('javaMinorVersion', javaMinorVersionControl);
        }
        this.group.controls['javaMinorVersion'].markAsDirty();

        this._setDropDownOptions('javaMinorVersion', javaMinorVersionOptions);
      }

      // WebContainer
      if (javaWebContainerNeedsUpdate) {
        const javaWebContainerControl = this._fb.control({ value: defaultJavaWebContainer, disabled: !this.hasWritePermissions });

        if (!!this.group.controls['javaWebContainer']) {
          this.group.setControl('javaWebContainer', javaWebContainerControl);
        } else {
          this.group.addControl('javaWebContainer', javaWebContainerControl);
        }
        this.group.controls['javaWebContainer'].markAsDirty();

        this._setDropDownOptions('javaWebContainer', javaWebContainerOptions);
      }

      setTimeout(() => {
        this._setEnabledStackControls();
      }, 0);
    }
  }

  public onJavaMinorVersionChange(javaMinorVersion: string) {
    this._updateFunctionsJavaWarnings(!!this.group.controls['javaVersion'] && this.group.controls['javaVersion'].value, javaMinorVersion);
  }

  private _updateFunctionsJavaWarnings(javaVersion: string, javaMinorVersion: string) {
    this.showFunctionsJavaVersionUnspecifiedWarning = this.isJavaFunctionApp && !javaVersion;
    this.showFunctionsJavaMinorVersionWarning =
      this.isJavaFunctionApp && javaVersion === this._functionsSupportedJavaVersion && !!javaMinorVersion;
  }

  private _parseAvailableStacks(availableStacksArm: ArmArrayResult<AvailableStack>) {
    this._dropDownOptionsMapClean = {};

    availableStacksArm.value.forEach(availableStackArm => {
      switch (availableStackArm.name) {
        case AvailableStackNames.NetStack:
          this._parseNetStackOptions(availableStackArm.properties);
          break;
        case AvailableStackNames.PhpStack:
          this._parsePhpStackOptions(availableStackArm.properties);
          break;
        case AvailableStackNames.PythonStack:
          this._parsePythonStackOptions(availableStackArm.properties);
          break;
        case AvailableStackNames.JavaStack:
          this._parseJavaStackOptions(availableStackArm.properties);
          break;
        case AvailableStackNames.JavaContainer:
          this._parseJavaContainerOptions(availableStackArm.properties);
          break;
        default:
          break;
      }
    });
  }

  private _parseNetStackOptions(availableStack: AvailableStack) {
    this._dropDownOptionsMapClean = this._dropDownOptionsMapClean || {};

    const netFrameworkVersionOptions: DropDownElement<string>[] = [];

    availableStack.majorVersions.forEach(majorVersion => {
      netFrameworkVersionOptions.push({
        displayLabel: majorVersion.displayVersion,
        value: majorVersion.runtimeVersion,
        default: false,
      });
    });

    this._dropDownOptionsMapClean[AvailableStackNames.NetStack] = netFrameworkVersionOptions;
  }

  private _parsePhpStackOptions(availableStack: AvailableStack) {
    this._dropDownOptionsMapClean = this._dropDownOptionsMapClean || {};

    const phpVersionOptions: DropDownElement<string>[] = [];

    phpVersionOptions.push({
      displayLabel: this._translateService.instant(PortalResources.off),
      value: '',
      default: false,
    });

    availableStack.majorVersions.forEach(majorVersion => {
      phpVersionOptions.push({
        displayLabel: majorVersion.displayVersion,
        value: majorVersion.runtimeVersion,
        default: false,
      });
    });

    this._dropDownOptionsMapClean[AvailableStackNames.PhpStack] = phpVersionOptions;
  }

  private _parsePythonStackOptions(availableStack: AvailableStack) {
    this._dropDownOptionsMapClean = this._dropDownOptionsMapClean || {};

    const pythonVersionOptions: DropDownElement<string>[] = [];

    pythonVersionOptions.push({
      displayLabel: this._translateService.instant(PortalResources.off),
      value: '',
      default: false,
    });

    availableStack.majorVersions.forEach(majorVersion => {
      pythonVersionOptions.push({
        displayLabel: majorVersion.displayVersion,
        value: majorVersion.runtimeVersion,
        default: false,
      });
    });

    this._dropDownOptionsMapClean[AvailableStackNames.PythonStack] = pythonVersionOptions;
  }

  private _parseJavaStackOptions(availableStack: AvailableStack) {
    this._dropDownOptionsMapClean = this._dropDownOptionsMapClean || {};
    this._javaMinorToMajorVersionsMap = {};
    this._javaMinorVersionOptionsMap = {};

    const javaVersionOptions: DropDownElement<string>[] = [];
    const javaVersionOptionsForFunctions: DropDownElement<string>[] = [];

    javaVersionOptions.push({
      displayLabel: this._translateService.instant(PortalResources.off),
      value: '',
      default: false,
    });

    javaVersionOptionsForFunctions.push({
      displayLabel: this._translateService.instant(PortalResources.notSelected),
      value: '',
      default: false,
    });

    availableStack.majorVersions.forEach(majorVersion => {
      this._parseJavaMinorStackOptions(majorVersion);

      const option: DropDownElement<string> = {
        // The value of majorVersion.displayVersion may be '1.7', '1.8' or '11'.
        // We want to display 'Java 7', 'Java 8', or 'Java 11' respectively.
        displayLabel: `Java ${majorVersion.displayVersion.split('.')[1] || majorVersion.displayVersion}`,
        value: majorVersion.runtimeVersion,
        default: false,
      };

      if (option.value === this._functionsSupportedJavaVersion) {
        this.functionsSupportedJavaVersionDisplay = option.displayLabel;
      }

      javaVersionOptions.push(option);
      if (majorVersion.runtimeVersion === this._functionsSupportedJavaVersion) {
        javaVersionOptionsForFunctions.push(option);
      }
    });

    this._dropDownOptionsMapClean[AvailableStackNames.JavaStack] = javaVersionOptions;
    this._dropDownOptionsMapClean[AvailableStackNames.JavaStackForFunctions] = javaVersionOptionsForFunctions;
  }

  private _parseJavaMinorStackOptions(majorVersion: MajorVersion) {
    this._javaMinorToMajorVersionsMap = this._javaMinorToMajorVersionsMap || {};
    this._javaMinorVersionOptionsMap = this._javaMinorVersionOptionsMap || {};

    const javaMinorVersionOptions: DropDownElement<string>[] = [];

    majorVersion.minorVersions.forEach(minorVersion => {
      this._javaMinorToMajorVersionsMap[minorVersion.runtimeVersion] = majorVersion.runtimeVersion;
      javaMinorVersionOptions.push({
        displayLabel: minorVersion.displayVersion,
        value: minorVersion.runtimeVersion,
        default: false,
      });
    });

    javaMinorVersionOptions.push({
      displayLabel: this._translateService.instant(PortalResources.autoUpdate),
      value: '',
      default: false,
    });

    this._javaMinorVersionOptionsMap[majorVersion.runtimeVersion] = javaMinorVersionOptions;
  }

  private _parseJavaContainerOptions(availableStack: AvailableStack) {
    this._dropDownOptionsMapClean = this._dropDownOptionsMapClean || {};

    const javaWebContainerOptions: DropDownElement<string>[] = [];

    javaWebContainerOptions.push({
      displayLabel: this._translateService.instant(PortalResources.notSelected),
      value: JSON.stringify(this._emptyJavaWebContainerProperties),
      default: false,
    });

    availableStack.frameworks.forEach(framework => {
      framework.majorVersions.forEach(majorVersion => {
        majorVersion.minorVersions.forEach(minorVersion => {
          javaWebContainerOptions.push({
            displayLabel: framework.display + ' ' + minorVersion.displayVersion,
            value: JSON.stringify({
              container: framework.name,
              containerMajorVersion: majorVersion.runtimeVersion,
              containerMinorVersion: minorVersion.runtimeVersion,
            }),
            default: false,
          });
        });

        javaWebContainerOptions.push({
          displayLabel: this._translateService.instant(PortalResources.versionAutoUpdate, {
            version: `${framework.display} ${majorVersion.displayVersion}`,
          }),
          value: JSON.stringify({
            container: framework.name,
            containerMajorVersion: majorVersion.runtimeVersion,
            containerMinorVersion: '',
          }),
          default: false,
        });
      });
    });

    this._dropDownOptionsMapClean[AvailableStackNames.JavaContainer] = javaWebContainerOptions;
  }

  private _parseLinuxBuiltInStacks(builtInStacks: ArmArrayResult<AvailableStack>) {
    const linuxFxVersionOptions: DropDownGroupElement<string>[] = [];

    builtInStacks.value.forEach(availableStackArm => {
      const availableStack: AvailableStack = availableStackArm.properties;

      const dropDownGroupElement: DropDownGroupElement<string> = {
        displayLabel: availableStack.display,
        dropDownElements: [],
      };

      availableStack.majorVersions.forEach(majorVersion => {
        dropDownGroupElement.dropDownElements.push({
          displayLabel: majorVersion.displayVersion,
          value: majorVersion.runtimeVersion,
          default: false,
        });
      });

      linuxFxVersionOptions.push(dropDownGroupElement);
    });

    this._linuxFxVersionOptionsClean = linuxFxVersionOptions;
  }

  private _setupLinux(
    group: FormGroup,
    linuxFxVersionOptions: DropDownGroupElement<string>[],
    linuxFxVersion: string,
    appCommandLine: string
  ) {
    if (this.linuxRuntimeSupported) {
      let defaultFxVersionValue = '';

      this._linuxFxVersionOptionsClean.forEach(g => {
        const dropDownGroupElement: DropDownGroupElement<string> = {
          displayLabel: g.displayLabel,
          dropDownElements: [],
        };

        g.dropDownElements.forEach(element => {
          const match = element.value.toUpperCase() === linuxFxVersion.toUpperCase() || (!element.value && !linuxFxVersion);
          defaultFxVersionValue = match ? element.value : defaultFxVersionValue;

          dropDownGroupElement.dropDownElements.push({
            displayLabel: element.displayLabel,
            value: element.value,
            default: match,
          });
        });

        linuxFxVersionOptions.push(dropDownGroupElement);
      });

      const linuxFxVersionControl = this._fb.control({ value: defaultFxVersionValue, disabled: !this.hasWritePermissions });
      group.addControl('linuxFxVersion', linuxFxVersionControl);

      const appCommandLineControl = this._fb.control({ value: appCommandLine, disabled: !this.hasWritePermissions });
      group.addControl('appCommandLine', appCommandLineControl);
    }
  }

  validate() {
    const controls = this.group.controls;
    for (const controlName in controls) {
      if (controls[controlName]) {
        const control = <CustomFormControl>controls[controlName];
        control._msRunValidation = true;
        control.updateValueAndValidity();
      }
    }
  }

  protected _getConfigsFromForms(saveConfigs: ArmSaveConfigs): ArmSaveConfigs {
    const generalSettingsControls = this.group.controls;

    let sitePristine = true;
    let siteConfigPristine = true;

    for (const name in generalSettingsControls) {
      if (generalSettingsControls[name].dirty) {
        if (name === 'clientAffinityEnabled') {
          sitePristine = false;
        } else {
          siteConfigPristine = false;
        }
      }
    }

    let siteArm: ArmObj<Site> = null;

    if (!sitePristine) {
      siteArm =
        saveConfigs && saveConfigs.siteArm ? JSON.parse(JSON.stringify(saveConfigs.siteArm)) : JSON.parse(JSON.stringify(this.siteArm));
      siteArm.id = this.resourceId;

      if (this.clientAffinitySupported) {
        siteArm.properties.clientAffinityEnabled = <boolean>generalSettingsControls['clientAffinityEnabled'].value;
      }
    }

    let siteConfigArm: ArmObj<SiteConfig> = null;

    if (!siteConfigPristine) {
      siteConfigArm =
        saveConfigs && saveConfigs.siteConfigArm
          ? JSON.parse(JSON.stringify(saveConfigs.siteConfigArm))
          : JSON.parse(JSON.stringify(this.siteConfigArm));
      siteConfigArm.id = `${this.resourceId}/config/web`;

      // -- non-stack settings --
      if (this.platform64BitSupported) {
        siteConfigArm.properties.use32BitWorkerProcess = <boolean>generalSettingsControls['use32BitWorkerProcess'].value;
      }
      if (this.webSocketsSupported) {
        siteConfigArm.properties.webSocketsEnabled = <boolean>generalSettingsControls['webSocketsEnabled'].value;
      }
      if (this.alwaysOnSupported) {
        siteConfigArm.properties.alwaysOn = <boolean>generalSettingsControls['alwaysOn'].value;
      }
      if (this.classicPipelineModeSupported) {
        siteConfigArm.properties.managedPipelineMode = <string>generalSettingsControls['managedPipelineMode'].value;
      }
      if (this.remoteDebuggingSupported) {
        siteConfigArm.properties.remoteDebuggingEnabled = <boolean>generalSettingsControls['remoteDebuggingEnabled'].value;
        siteConfigArm.properties.remoteDebuggingVersion = <string>generalSettingsControls['remoteDebuggingVersion'].value;
      }
      if (this.autoSwapSupported) {
        const autoSwapEnabled = <boolean>generalSettingsControls['autoSwapEnabled'].value;
        siteConfigArm.properties.autoSwapSlotName = autoSwapEnabled ? <string>generalSettingsControls['autoSwapSlotName'].value : '';
      }
      if (this.FTPAccessSupported) {
        siteConfigArm.properties.ftpsState = <string>generalSettingsControls['FTPAccessOptions'].value;
      }
      if (this.http20Supported) {
        siteConfigArm.properties.http20Enabled = <boolean>generalSettingsControls['http20Enabled'].value;
      }

      // -- stacks settings --
      if (this.netFrameworkSupported) {
        siteConfigArm.properties.netFrameworkVersion = <string>generalSettingsControls['netFrameworkVersion'].value;
      }
      if (this.phpSupported) {
        siteConfigArm.properties.phpVersion = <string>generalSettingsControls['phpVersion'].value;
      }
      if (this.pythonSupported) {
        siteConfigArm.properties.pythonVersion = <string>generalSettingsControls['pythonVersion'].value;
      }
      if (this.javaSupported) {
        siteConfigArm.properties.javaVersion =
          <string>generalSettingsControls['javaMinorVersion'].value || <string>generalSettingsControls['javaVersion'].value || '';
        const javaWebContainerProperties: JavaWebContainerProperties = JSON.parse(<string>(
          generalSettingsControls['javaWebContainer'].value
        ));
        siteConfigArm.properties.javaContainer = !siteConfigArm.properties.javaVersion ? '' : javaWebContainerProperties.container || '';
        siteConfigArm.properties.javaContainerVersion = !siteConfigArm.properties.javaVersion
          ? ''
          : javaWebContainerProperties.containerMinorVersion || javaWebContainerProperties.containerMajorVersion || '';
      }
      if (this.linuxRuntimeSupported) {
        siteConfigArm.properties.linuxFxVersion = <string>generalSettingsControls['linuxFxVersion'].value;
        siteConfigArm.properties.appCommandLine = <string>generalSettingsControls['appCommandLine'].value;
      }
    }

    return {
      siteArm: siteArm,
      siteConfigArm: siteConfigArm,
    };
  }
}
