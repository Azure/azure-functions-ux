import { PortalService } from './../../../shared/services/portal.service';
import { BroadcastService } from './../../../shared/services/broadcast.service';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import { SaveOrValidationResult } from '../site-config.component';
import { Site } from 'app/shared/models/arm/site';
import { SiteConfig } from 'app/shared/models/arm/site-config';
import { AvailableStackNames, AvailableStack, Framework, MajorVersion, LinuxConstants } from 'app/shared/models/arm/stacks';
import { DropDownElement, DropDownGroupElement } from './../../../shared/models/drop-down-element';
import { SelectOption } from './../../../shared/models/select-option';

import { Links, LogCategories } from 'app/shared/models/constants';
import { LogService } from './../../../shared/services/log.service';
import { PortalResources } from './../../../shared/models/portal-resources';
import { BusyStateScopeManager } from './../../../busy-state/busy-state-scope-manager';
import { CustomFormControl } from './../../../controls/click-to-edit/click-to-edit.component';
import { ArmObj, ArmArrayResult } from './../../../shared/models/arm/arm-obj';
import { CacheService } from './../../../shared/services/cache.service';
import { AuthzService } from './../../../shared/services/authz.service';
import { SiteDescriptor } from 'app/shared/resourceDescriptors';

import { JavaWebContainerProperties } from './models/java-webcontainer-properties';
import { ArmUtil } from 'app/shared/Utilities/arm-utils';

@Component({
  selector: 'general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./../site-config.component.scss']
})
export class GeneralSettingsComponent implements OnChanges, OnDestroy {
  public Resources = PortalResources;
  public group: FormGroup;

  private _resourceIdStream: Subject<string>;
  private _resourceIdSubscription: RxSubscription;
  public hasWritePermissions: boolean;
  public permissionsMessage: string;
  public showPermissionsMessage: boolean;
  public showReadOnlySettingsMessage: string;

  private _busyManager: BusyStateScopeManager;

  private _saveError: string;

  private _webConfigArm: ArmObj<SiteConfig>;
  public siteArm: ArmObj<Site>;
  public loadingFailureMessage: string;
  public loadingMessage: string;

  private _sku: string;
  private _kind: string;

  public FwLinks = Links;

  public clientAffinityEnabledOptions: SelectOption<boolean>[];
  public use32BitWorkerProcessOptions: SelectOption<boolean>[];
  public webSocketsEnabledOptions: SelectOption<boolean>[];
  public alwaysOnOptions: SelectOption<boolean>[];
  public managedPipelineModeOptions: SelectOption<number>[];
  public remoteDebuggingEnabledOptions: SelectOption<boolean>[];
  public remoteDebuggingVersionOptions: SelectOption<string>[];

  private _emptyJavaWebContainerProperties: JavaWebContainerProperties = { container: '-', containerMajorVersion: '', containerMinorVersion: '' };

  public versionOptionsMap: { [key: string]: DropDownElement<string>[] };
  private _versionOptionsMapClean: { [key: string]: DropDownElement<string>[] };
  private _javaMinorVersionOptionsMap: { [key: string]: DropDownElement<string>[] };
  private _javaMinorToMajorVersionsMap: { [key: string]: string };

  private _selectedJavaVersion: string;

  public netFrameworkSupported = false;
  public phpSupported = false;
  public pythonSupported = false;
  public javaSupported = false;
  public platform64BitSupported = false;
  public webSocketsSupported = false;
  public alwaysOnSupported = false;
  public classicPipelineModeSupported = false;
  public remoteDebuggingSupported = false;
  public clientAffinitySupported = false;

  public autoSwapSupported = false;
  public autoSwapEnabledOptions: SelectOption<boolean>[];
  public autoSwapSlotNameOptions: DropDownElement<string>[];

  public linuxRuntimeSupported = false;
  public linuxFxVersionOptions: DropDownGroupElement<string>[];
  private _linuxFxVersionOptionsClean: DropDownGroupElement<string>[];


  @Input() mainForm: FormGroup;

  @Input() resourceId: string;

  private _slotsConfigArmPath: string;
  private _slotsConfigArm: ArmArrayResult<Site>;
  public isProductionSlot: boolean;

  private _ignoreChildEvents = true;

  constructor(
    private _cacheService: CacheService,
    private _fb: FormBuilder,
    private _translateService: TranslateService,
    private _logService: LogService,
    private _authZService: AuthzService,
    private _portalService: PortalService,
    broadcastService: BroadcastService
  ) {
    this._busyManager = new BusyStateScopeManager(broadcastService, 'site-tabs');

    this._resetSlotsInfo();

    this._resetPermissionsAndLoadingState();

    this._generateRadioOptions();

    this._resourceIdStream = new Subject<string>();
    this._resourceIdSubscription = this._resourceIdStream
      .distinctUntilChanged()
      .switchMap(() => {
        this._busyManager.setBusy();
        this._saveError = null;
        this.siteArm = null;
        this._webConfigArm = null;
        this.group = null;
        this.versionOptionsMap = null;
        this._ignoreChildEvents = true;
        this._resetSlotsInfo();
        this._resetSupportedControls();
        this._resetPermissionsAndLoadingState();
        return Observable.zip(
          this._authZService.hasPermission(this.resourceId, [AuthzService.writeScope]),
          this._authZService.hasReadOnlyLock(this.resourceId),
          (wp, rl) => ({ writePermission: wp, readOnlyLock: rl })
        );
      })
      .mergeMap(p => {
        this._setPermissions(p.writePermission, p.readOnlyLock);
        return Observable.zip(
          Observable.of(this.hasWritePermissions),
          this._cacheService.getArm(`${this.resourceId}`, true),
          this._cacheService.getArm(this._slotsConfigArmPath, true),
          this._cacheService.getArm(`${this.resourceId}/config/web`, true),
          this._cacheService.getArm(`/providers/Microsoft.Web/availablestacks`),
          (h, c, t, w, s) => ({
            hasWritePermissions: h,
            siteConfigResponse: c,
            slotsConfigResponse: t,
            webConfigResponse: w,
            availableStacksResponse: s
          })
        );
      })
      .do(null, error => {
        this._logService.error(LogCategories.generalSettings, '/general-settings', error);
        this._setupForm(null, null, null);
        this.loadingFailureMessage = this._translateService.instant(PortalResources.configLoadFailure);
        this.loadingMessage = null;
        this.showPermissionsMessage = true;
        this._busyManager.clearBusy();
      })
      .retry()
      .subscribe(r => {
        this.siteArm = r.siteConfigResponse.json();
        this._webConfigArm = r.webConfigResponse.json();
        this._slotsConfigArm = r.slotsConfigResponse.json();
        const availableStacksArm = r.availableStacksResponse.json();
        if (!this._versionOptionsMapClean) {
          this._parseAvailableStacks(availableStacksArm);
        }
        if (!this._linuxFxVersionOptionsClean) {
          this._parseLinuxBuiltInStacks(LinuxConstants.builtInStacks);
        }
        this._processSupportedControls(this.siteArm, this._webConfigArm, this._slotsConfigArm);
        this._setupForm(this._webConfigArm, this.siteArm, this._slotsConfigArm);
        this.loadingMessage = null;
        this.showPermissionsMessage = true;
        this._busyManager.clearBusy();
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['resourceId']) {
      this._resourceIdStream.next(this.resourceId);
    }
    if (changes['mainForm'] && !changes['resourceId']) {
      this._setupForm(this._webConfigArm, this.siteArm, this._slotsConfigArm);
    }
  }

  ngOnDestroy(): void {
    if (this._resourceIdSubscription) {
      this._resourceIdSubscription.unsubscribe();
      this._resourceIdSubscription = null;
    }
    this._busyManager.clearBusy();
  }

  scaleUp() {
    this._busyManager.setBusy();

    const inputs = {
      aspResourceId: this.siteArm.properties.serverFarmId,
      aseResourceId: this.siteArm.properties.hostingEnvironmentProfile
        && this.siteArm.properties.hostingEnvironmentProfile.id
    };

    const openScaleUpBlade = this._portalService.openCollectorBladeWithInputs(
      '',
      inputs,
      'site-manage',
      null,
      'WebsiteSpecPickerV3');

    openScaleUpBlade
      .first()
      .subscribe(r => {
        this._busyManager.clearBusy();
        this._logService.debug(LogCategories.siteConfig, `Scale up ${r ? 'succeeded' : 'cancelled'}`);
      },
      e => {
        this._busyManager.clearBusy();
        this._logService.error(LogCategories.siteConfig, '/scale-up', `Scale up failed: ${e}`);
      });
  }

  private _resetSlotsInfo() {
    this._slotsConfigArmPath = null;
    this._slotsConfigArm = null;
    this.isProductionSlot = true;

    if (this.resourceId) {
      const siteDescriptor = new SiteDescriptor(this.resourceId);
      this._slotsConfigArmPath = `${siteDescriptor.getSiteOnlyResourceId()}/slots`;
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
    this.clientAffinitySupported = false;
    this.autoSwapSupported = false;
    this.linuxRuntimeSupported = false;
  }

  private _processSupportedControls(siteConfigArm: ArmObj<Site>, webConfigArm: ArmObj<SiteConfig>, slotsConfigArm: ArmArrayResult<Site>) {
    if (!!siteConfigArm) {
      let netFrameworkSupported = true;
      let phpSupported = true;
      let pythonSupported = true;
      let javaSupported = true;
      let platform64BitSupported = true;
      let webSocketsSupported = true;
      let alwaysOnSupported = true;
      let classicPipelineModeSupported = true;
      let remoteDebuggingSupported = true;
      let clientAffinitySupported = true;
      let autoSwapSupported = false;
      let linuxRuntimeSupported = false;

      this._sku = siteConfigArm.properties.sku;
      this._kind = siteConfigArm.kind;

      if (slotsConfigArm && slotsConfigArm.value && slotsConfigArm.value.length > 0) {
        autoSwapSupported = true;
      }

      if (this._kind.indexOf('linux') >= 0) {
        netFrameworkSupported = false;
        phpSupported = false;
        pythonSupported = false;
        javaSupported = false;
        platform64BitSupported = false;
        webSocketsSupported = false;
        classicPipelineModeSupported = false;
        remoteDebuggingSupported = false;

        if ((webConfigArm.properties.linuxFxVersion || '').indexOf(LinuxConstants.dockerPrefix) === -1) {
          linuxRuntimeSupported = true;
        }

        autoSwapSupported = false;
      }

      if (ArmUtil.isFunctionApp(siteConfigArm)) {
        netFrameworkSupported = false;
        pythonSupported = false;
        javaSupported = false;
        classicPipelineModeSupported = false;

        if (this._sku === 'Dynamic') {
          webSocketsSupported = false;
          alwaysOnSupported = false;
          clientAffinitySupported = false;
        }
      }
      // if (this._sku === 'Free' || this._sku === 'Shared') {
      //   platform64BitSupported = false;
      //   alwaysOnSupported = false;
      // }

      this.netFrameworkSupported = netFrameworkSupported;
      this.phpSupported = phpSupported;
      this.pythonSupported = pythonSupported;
      this.javaSupported = javaSupported;
      this.platform64BitSupported = platform64BitSupported;
      this.webSocketsSupported = webSocketsSupported;
      this.alwaysOnSupported = alwaysOnSupported;
      this.classicPipelineModeSupported = classicPipelineModeSupported;
      this.remoteDebuggingSupported = remoteDebuggingSupported;
      this.clientAffinitySupported = clientAffinitySupported;
      this.autoSwapSupported = autoSwapSupported;
      this.linuxRuntimeSupported = linuxRuntimeSupported;
    }
  }

  private _setupForm(webConfigArm: ArmObj<SiteConfig>, siteConfigArm: ArmObj<Site>, slotsConfigArm: ArmArrayResult<Site>) {
    if (!!webConfigArm && !!siteConfigArm && !!slotsConfigArm) {

      this._ignoreChildEvents = true;

      if (!this._saveError || !this.group) {
        const group = this._fb.group({});
        const versionOptionsMap: { [key: string]: DropDownElement<string>[] } = {};
        const linuxFxVersionOptions: DropDownGroupElement<string>[] = [];
        const autoSwapSlotNameOptions: DropDownElement<string>[] = [];

        this._setupNetFramworkVersion(group, versionOptionsMap, webConfigArm.properties.netFrameworkVersion);
        this._setupPhpVersion(group, versionOptionsMap, webConfigArm.properties.phpVersion);
        this._setupPythonVersion(group, versionOptionsMap, webConfigArm.properties.pythonVersion);
        this._setupJava(group, versionOptionsMap, webConfigArm.properties.javaVersion, webConfigArm.properties.javaContainer, webConfigArm.properties.javaContainerVersion);
        this._setupGeneralSettings(group, webConfigArm, siteConfigArm);

        this._setupAutoSwapSettings(group, autoSwapSlotNameOptions, webConfigArm, siteConfigArm, slotsConfigArm);

        this._setupLinux(group, linuxFxVersionOptions, webConfigArm.properties.linuxFxVersion, webConfigArm.properties.appCommandLine);

        this.group = group;
        this.versionOptionsMap = versionOptionsMap;
        this.linuxFxVersionOptions = linuxFxVersionOptions;
        this.autoSwapSlotNameOptions = autoSwapSlotNameOptions;

      }

      if (this.mainForm.contains('generalSettings')) {
        this.mainForm.setControl('generalSettings', this.group);
      } else {
        this.mainForm.addControl('generalSettings', this.group);
      }

      setTimeout(() => { this._ignoreChildEvents = false; }, 0);

      setTimeout(() => { this._setEnabledStackControls(); }, 0);

    } else {

      this.group = null;
      this.versionOptionsMap = null;

      if (this.mainForm.contains('generalSettings')) {
        this.mainForm.removeControl('generalSettings');
      }

    }

    this._saveError = null;
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
    this._setControlsEnabledState(['netFrameworkVersion'], !this._selectedJavaVersion);
    if (this.phpSupported) {
      this._setControlsEnabledState(['phpVersion'], !this._selectedJavaVersion);
    }
    if (this.pythonSupported) {
      this._setControlsEnabledState(['pythonVersion'], !this._selectedJavaVersion);
    }
    if (this.javaSupported) {
      this._setControlsEnabledState(['javaVersion'], true);
      this._setControlsEnabledState(['javaMinorVersion', 'javaWebContainer'], !!this._selectedJavaVersion);
    }
  }

  private _generateRadioOptions() {
    const onString = this._translateService.instant(PortalResources.on);
    const offString = this._translateService.instant(PortalResources.off);

    this.clientAffinityEnabledOptions =
      [{ displayLabel: offString, value: false },
      { displayLabel: onString, value: true }];

    this.use32BitWorkerProcessOptions =
      [{ displayLabel: this._translateService.instant(PortalResources.architecture32), value: true },
      { displayLabel: this._translateService.instant(PortalResources.architecture64), value: false }];

    this.webSocketsEnabledOptions =
      [{ displayLabel: offString, value: false },
      { displayLabel: onString, value: true }];

    this.alwaysOnOptions =
      [{ displayLabel: offString, value: false },
      { displayLabel: onString, value: true }];

    this.managedPipelineModeOptions =
      [{ displayLabel: this._translateService.instant(PortalResources.pipelineModeIntegrated), value: 0 },
      { displayLabel: this._translateService.instant(PortalResources.pipelineModeClassic), value: 1 }];

    this.remoteDebuggingEnabledOptions =
      [{ displayLabel: offString, value: false },
      { displayLabel: onString, value: true }];

    this.remoteDebuggingVersionOptions =
      [{ displayLabel: '2012', value: 'VS2012' },
      { displayLabel: '2013', value: 'VS2013' },
      { displayLabel: '2015', value: 'VS2015' },
      { displayLabel: '2017', value: 'VS2017' }];

    this.autoSwapEnabledOptions =
      [{ displayLabel: offString, value: false },
      { displayLabel: onString, value: true }];
  }

  private _setupGeneralSettings(group: FormGroup, webConfigArm: ArmObj<SiteConfig>, siteConfigArm: ArmObj<Site>) {
    if (this.platform64BitSupported) {
      group.addControl('use32BitWorkerProcess', this._fb.control(webConfigArm.properties.use32BitWorkerProcess));
    }
    if (this.webSocketsSupported) {
      group.addControl('webSocketsEnabled', this._fb.control(webConfigArm.properties.webSocketsEnabled));
    }
    if (this.alwaysOnSupported) {
      group.addControl('alwaysOn', this._fb.control(webConfigArm.properties.alwaysOn));
    }
    if (this.classicPipelineModeSupported) {
      group.addControl('managedPipelineMode', this._fb.control(webConfigArm.properties.managedPipelineMode));
    }
    if (this.clientAffinitySupported) {
      group.addControl('clientAffinityEnabled', this._fb.control(siteConfigArm.properties.clientAffinityEnabled));
    }
    if (this.remoteDebuggingSupported) {
      group.addControl('remoteDebuggingEnabled', this._fb.control(webConfigArm.properties.remoteDebuggingEnabled));
      group.addControl('remoteDebuggingVersion', this._fb.control(webConfigArm.properties.remoteDebuggingVersion));
      setTimeout(() => { this._setControlsEnabledState(['remoteDebuggingVersion'], webConfigArm.properties.remoteDebuggingEnabled); }, 0);
    }
  }

  public updateRemoteDebuggingVersionOptions(enabled: boolean) {
    if (!this._ignoreChildEvents) {
      this._setControlsEnabledState(['remoteDebuggingVersion'], enabled);
    }
  }

  private _setupAutoSwapSettings(
    group: FormGroup,
    autoSwapSlotNameOptions: DropDownElement<string>[],
    webConfigArm: ArmObj<SiteConfig>,
    siteConfigArm: ArmObj<Site>,
    slotsConfigArm: ArmArrayResult<Site>
  ) {
    if (this.autoSwapSupported) {
      if (this.isProductionSlot) {
        group.addControl('autoSwapEnabled', this._fb.control(false));
        group.addControl('autoSwapSlotName', this._fb.control(null));
        setTimeout(() => { this._setControlsEnabledState(['autoSwapEnabled', 'autoSwapSlotName'], false); }, 0);
      }
      else {
        const slotNames: string[] = ['production'];
        slotsConfigArm.value
          .map(s => s.name)
          .filter(r => r !== siteConfigArm.name)
          .forEach(n => slotNames.push(n.split("/").slice(-1)[0]))

        slotNames.forEach(name => {
          autoSwapSlotNameOptions.push({
            displayLabel: name,
            value: name,
            default: name === webConfigArm.properties.autoSwapSlotName
          });
        })

        group.addControl('autoSwapEnabled', this._fb.control(!!webConfigArm.properties.autoSwapSlotName));
        group.addControl('autoSwapSlotName', this._fb.control(webConfigArm.properties.autoSwapSlotName));
        setTimeout(() => { this._setControlsEnabledState(['autoSwapSlotName'], !!webConfigArm.properties.autoSwapSlotName); }, 0);
      }
    }
  }

  public updateAutoSwapSlotNameOptions(enabled: boolean) {
    if (!this._ignoreChildEvents) {
      this._setControlsEnabledState(['autoSwapSlotName'], enabled);
      setTimeout(() => {
        this.group.controls['autoSwapSlotName'].markAsDirty();
      }, 0);
    }
  }

  private _setVersionOptions(name: string, options: DropDownElement<string>[]) {
    this.versionOptionsMap = this.versionOptionsMap || {};
    this.versionOptionsMap[name] = options;
  }

  private _setupNetFramworkVersion(group: FormGroup, versionOptionsMap: { [key: string]: DropDownElement<string>[] }, netFrameworkVersion: string) {
    if (this.netFrameworkSupported) {
      let defaultValue = '';

      const netFrameworkVersionOptions: DropDownElement<string>[] = [];
      const netFrameworkVersionOptionsClean = this._versionOptionsMapClean[AvailableStackNames.NetStack];

      netFrameworkVersionOptionsClean.forEach(element => {
        const match = element.value === netFrameworkVersion || (!element.value && !netFrameworkVersion);
        defaultValue = match ? element.value : defaultValue;

        netFrameworkVersionOptions.push({
          displayLabel: element.displayLabel,
          value: element.value,
          default: match
        });
      });

      const netFrameworkVersionControl = this._fb.control(defaultValue);
      group.addControl('netFrameworkVersion', netFrameworkVersionControl);

      versionOptionsMap["netFrameworkVersion"] = netFrameworkVersionOptions;
    }
  }

  private _setupPhpVersion(group: FormGroup, versionOptionsMap: { [key: string]: DropDownElement<string>[] }, phpVersion: string) {
    if (this.phpSupported) {

      let defaultValue = '';

      const phpVersionOptions: DropDownElement<string>[] = [];
      const phpVersionOptionsClean = this._versionOptionsMapClean[AvailableStackNames.PhpStack];

      phpVersionOptionsClean.forEach(element => {
        const match = element.value === phpVersion || (!element.value && !phpVersion);
        defaultValue = match ? element.value : defaultValue;

        phpVersionOptions.push({
          displayLabel: element.displayLabel,
          value: element.value,
          default: match
        });
      });

      const phpVersionControl = this._fb.control(defaultValue);
      group.addControl('phpVersion', phpVersionControl);

      versionOptionsMap["phpVersion"] = phpVersionOptions;
    }
  }

  private _setupPythonVersion(group: FormGroup, versionOptionsMap: { [key: string]: DropDownElement<string>[] }, pythonVersion: string) {
    if (this.pythonSupported) {

      let defaultValue = '';

      const pythonVersionOptions: DropDownElement<string>[] = [];
      const pythonVersionOptionsClean = this._versionOptionsMapClean[AvailableStackNames.PythonStack];

      pythonVersionOptionsClean.forEach(element => {
        const match = element.value === pythonVersion || (!element.value && !pythonVersion);
        defaultValue = match ? element.value : defaultValue;

        pythonVersionOptions.push({
          displayLabel: element.displayLabel,
          value: element.value,
          default: match
        });
      });

      const pythonVersionControl = this._fb.control(defaultValue);
      group.addControl('pythonVersion', pythonVersionControl);

      versionOptionsMap["pythonVersion"] = pythonVersionOptions;
    }
  }

  private _setupJava(group: FormGroup, versionOptionsMap: { [key: string]: DropDownElement<string>[] }, javaVersion: string, javaContainer: string, javaContainerVersion: string) {
    if (this.javaSupported) {

      let defaultJavaMinorVersion = '';
      let javaMinorVersionOptions: DropDownElement<string>[] = [];

      let defaultJavaVersion = '';
      const javaVersionOptions: DropDownElement<string>[] = [];
      const javaVersionOptionsClean = this._versionOptionsMapClean[AvailableStackNames.JavaStack];

      let defaultJavaWebContainer = JSON.stringify(this._emptyJavaWebContainerProperties);
      let javaWebContainerOptions: DropDownElement<string>[] = [];
      const javaWebContainerOptionsClean = this._versionOptionsMapClean[AvailableStackNames.JavaContainer];

      if (javaVersion) {
        if (this._javaMinorVersionOptionsMap[javaVersion]) {
          defaultJavaVersion = javaVersion;
        } else if (this._javaMinorToMajorVersionsMap[javaVersion]) {
          defaultJavaVersion = this._javaMinorToMajorVersionsMap[javaVersion];
          defaultJavaMinorVersion = javaVersion;
        } else {
          // TODO: How to handle an invalid javaVersion string
          // javaVersion = "";
        }
      }

      // MajorVersion
      this._selectedJavaVersion = defaultJavaVersion;
      javaVersionOptionsClean.forEach(element => {
        javaVersionOptions.push({
          displayLabel: element.displayLabel,
          value: element.value,
          default: element.value === defaultJavaVersion || (!element.value && !defaultJavaVersion)
        });
      });
      const javaVersionControl = this._fb.control(defaultJavaVersion);

      // MinorVersion
      if (defaultJavaVersion) {
        this._javaMinorVersionOptionsMap[defaultJavaVersion].forEach(element => {
          javaMinorVersionOptions.push({
            displayLabel: element.displayLabel,
            value: element.value,
            default: element.value === defaultJavaMinorVersion || (!element.value && !defaultJavaMinorVersion)
          });
        });
      } else {
        javaMinorVersionOptions = [];
      }
      const javaMinorVersionControl = this._fb.control(defaultJavaMinorVersion);

      // WebContainer
      if (defaultJavaVersion) {
        javaWebContainerOptionsClean.forEach(element => {
          let match = false;
          const parsedValue: JavaWebContainerProperties = JSON.parse(element.value);
          if (parsedValue.container.toUpperCase() === javaContainer &&
            (parsedValue.containerMinorVersion === javaContainerVersion ||
              (parsedValue.containerMajorVersion === javaContainerVersion && !parsedValue.containerMinorVersion))) {
            defaultJavaWebContainer = element.value;
            match = true;
          }
          javaWebContainerOptions.push({
            displayLabel: element.displayLabel,
            value: element.value,
            default: match
          });
        });
      } else {
        javaWebContainerOptions = [];
      }
      const javaWebContainerControl = this._fb.control(defaultJavaWebContainer);


      group.addControl('javaVersion', javaVersionControl);
      group.addControl('javaMinorVersion', javaMinorVersionControl);
      group.addControl('javaWebContainer', javaWebContainerControl);

      versionOptionsMap["javaVersion"] = javaVersionOptions;
      versionOptionsMap["javaMinorVersion"] = javaMinorVersionOptions;
      versionOptionsMap["javaWebContainer"] = javaWebContainerOptions;

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
        if (previousJavaVersionSelection) {
          javaMinorVersionOptions = [];
          defaultJavaMinorVersion = '';
          javaMinorVersionNeedsUpdate = true;

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
          const javaWebContainerOptionsClean = this._versionOptionsMapClean[AvailableStackNames.JavaContainer];
          javaWebContainerOptions = JSON.parse(JSON.stringify(javaWebContainerOptionsClean));
          javaWebContainerOptions[0].default = true;
          defaultJavaWebContainer = javaWebContainerOptions[0].value;
          javaWebContainerNeedsUpdate = true;
        }
      }

      // MinorVersion
      if (javaMinorVersionNeedsUpdate) {
        const javaMinorVersionControl = this._fb.control(defaultJavaMinorVersion);

        if (!!this.group.controls['javaMinorVersion']) {
          this.group.setControl('javaMinorVersion', javaMinorVersionControl);
        } else {
          this.group.addControl('javaMinorVersion', javaMinorVersionControl);
        }
        this.group.controls['javaMinorVersion'].markAsDirty();

        this._setVersionOptions("javaMinorVersion", javaMinorVersionOptions);
      }

      // WebContainer
      if (javaWebContainerNeedsUpdate) {
        const javaWebContainerControl = this._fb.control(defaultJavaWebContainer);

        if (!!this.group.controls['javaWebContainer']) {
          this.group.setControl('javaWebContainer', javaWebContainerControl);
        } else {
          this.group.addControl('javaWebContainer', javaWebContainerControl);
        }
        this.group.controls['javaWebContainer'].markAsDirty();

        this._setVersionOptions("javaWebContainer", javaWebContainerOptions);
      }

      setTimeout(() => { this._setEnabledStackControls(); }, 0);
    }
  }

  private _parseAvailableStacks(availableStacksArm: ArmArrayResult<AvailableStack>) {
    this._versionOptionsMapClean = {};

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
    this._versionOptionsMapClean = this._versionOptionsMapClean || {};

    const netFrameworkVersionOptions: DropDownElement<string>[] = [];

    availableStack.majorVersions.forEach(majorVersion => {
      netFrameworkVersionOptions.push({
        displayLabel: majorVersion.displayVersion,
        value: majorVersion.runtimeVersion,
        default: false
      });
    });

    this._versionOptionsMapClean[AvailableStackNames.NetStack] = netFrameworkVersionOptions;
  }

  private _parsePhpStackOptions(availableStack: AvailableStack) {
    this._versionOptionsMapClean = this._versionOptionsMapClean || {};

    const phpVersionOptions: DropDownElement<string>[] = [];

    phpVersionOptions.push({
      displayLabel: this._translateService.instant(PortalResources.off),
      value: '',
      default: false
    });

    availableStack.majorVersions.forEach(majorVersion => {
      phpVersionOptions.push({
        displayLabel: majorVersion.displayVersion,
        value: majorVersion.runtimeVersion,
        default: false
      });
    });

    this._versionOptionsMapClean[AvailableStackNames.PhpStack] = phpVersionOptions;
  }

  private _parsePythonStackOptions(availableStack: AvailableStack) {
    this._versionOptionsMapClean = this._versionOptionsMapClean || {};

    const pythonVersionOptions: DropDownElement<string>[] = [];

    pythonVersionOptions.push({
      displayLabel: this._translateService.instant(PortalResources.off),
      value: '',
      default: false
    });

    availableStack.majorVersions.forEach(majorVersion => {
      pythonVersionOptions.push({
        displayLabel: majorVersion.displayVersion,
        value: majorVersion.runtimeVersion,
        default: false
      });
    });

    this._versionOptionsMapClean[AvailableStackNames.PythonStack] = pythonVersionOptions;
  }

  private _parseJavaStackOptions(availableStack: AvailableStack) {
    this._versionOptionsMapClean = this._versionOptionsMapClean || {};
    this._javaMinorToMajorVersionsMap = {};
    this._javaMinorVersionOptionsMap = {};

    const javaVersionOptions: DropDownElement<string>[] = [];

    javaVersionOptions.push({
      displayLabel: this._translateService.instant(PortalResources.off),
      value: '',
      default: false
    });

    availableStack.majorVersions.forEach(majorVersion => {
      this._parseJavaMinorStackOptions(majorVersion);

      javaVersionOptions.push({
        displayLabel: 'Java ' + majorVersion.displayVersion.substr(2),
        value: majorVersion.runtimeVersion,
        default: false
      });
    });

    this._versionOptionsMapClean[AvailableStackNames.JavaStack] = javaVersionOptions;
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
        default: false
      });
    });

    javaMinorVersionOptions.push({
      displayLabel: this._translateService.instant(PortalResources.newest),
      value: '',
      default: false
    });

    this._javaMinorVersionOptionsMap[majorVersion.runtimeVersion] = javaMinorVersionOptions;
  }

  private _parseJavaContainerOptions(availableStack: AvailableStack) {
    this._versionOptionsMapClean = this._versionOptionsMapClean || {};

    const javaWebContainerOptions: DropDownElement<string>[] = [];

    availableStack.frameworks.forEach(framework => {

      framework.majorVersions.forEach(majorVersion => {

        majorVersion.minorVersions.forEach(minorVersion => {

          javaWebContainerOptions.push({
            displayLabel: framework.display + ' ' + minorVersion.displayVersion,
            value: JSON.stringify({ container: framework.name, containerMajorVersion: majorVersion.runtimeVersion, containerMinorVersion: minorVersion.runtimeVersion }),
            default: false
          });

        });

        javaWebContainerOptions.push({
          displayLabel: this._translateService.instant(PortalResources.newest) + ' ' + framework.display + ' ' + majorVersion.displayVersion,
          value: JSON.stringify({ container: framework.name, containerMajorVersion: majorVersion.runtimeVersion, containerMinorVersion: '' }),
          default: false
        });

      });

    });

    this._versionOptionsMapClean[AvailableStackNames.JavaContainer] = javaWebContainerOptions;
  }

  private _parseLinuxBuiltInStacks(builtInStacks: Framework[]) {
    const linuxFxVersionOptions: DropDownGroupElement<string>[] = [];

    LinuxConstants.builtInStacks.forEach(framework => {

      const dropDownGroupElement: DropDownGroupElement<string> = {
        displayLabel: framework.display,
        dropDownElements: []
      };

      framework.majorVersions.forEach(majorVersion => {

        majorVersion.minorVersions.forEach(minorVersion => {

          dropDownGroupElement.dropDownElements.push({
            displayLabel: framework.display + ' ' + minorVersion.displayVersion,
            value: framework.name + '|' + minorVersion.displayVersion,
            default: false
          });

        });

      });

      linuxFxVersionOptions.push(dropDownGroupElement);
    });

    this._linuxFxVersionOptionsClean = linuxFxVersionOptions;
  }

  private _setupLinux(group: FormGroup, linuxFxVersionOptions: DropDownGroupElement<string>[], linuxFxVersion: string, appCommandLine: string) {
    if (this.linuxRuntimeSupported) {
      let defaultFxVersionValue = '';

      this._linuxFxVersionOptionsClean.forEach(group => {

        const dropDownGroupElement: DropDownGroupElement<string> = {
          displayLabel: group.displayLabel,
          dropDownElements: []
        };

        group.dropDownElements.forEach(element => {

          const match = element.value === linuxFxVersion || (!element.value && !linuxFxVersion);
          defaultFxVersionValue = match ? element.value : defaultFxVersionValue;

          dropDownGroupElement.dropDownElements.push({
            displayLabel: element.displayLabel,
            value: element.value,
            default: match
          });

        });

        linuxFxVersionOptions.push(dropDownGroupElement);
      });

      const linuxFxVersionControl = this._fb.control(defaultFxVersionValue);
      group.addControl('linuxFxVersion', linuxFxVersionControl);

      const appCommandLineControl = this._fb.control(appCommandLine);
      group.addControl('appCommandLine', appCommandLineControl);
    }
  }

  validate(): SaveOrValidationResult {
    let controls = this.group.controls;
    for (let controlName in controls) {
      let control = <CustomFormControl>controls[controlName];
      control._msRunValidation = true;
      control.updateValueAndValidity();
    }

    return {
      success: this.group.valid,
      error: this.group.valid ? null : this._validationFailureMessage()
    };
  }

  save(): Observable<SaveOrValidationResult> {
    // Don't make unnecessary PATCH call if these settings haven't been changed
    if (this.group.pristine) {
      return Observable.of({
        success: true,
        error: null
      });
    }
    else if (this.mainForm.contains("generalSettings") && this.mainForm.controls["generalSettings"].valid) {
      const generalSettingsControls = this.group.controls;

      // level: site
      const siteConfigArm: ArmObj<Site> = JSON.parse(JSON.stringify(this.siteArm));

      if (this.clientAffinitySupported) {
        const clientAffinityEnabled = <boolean>(generalSettingsControls['clientAffinityEnabled'].value);
        siteConfigArm.properties.clientAffinityEnabled = clientAffinityEnabled;
      }

      // BUGBUG: Workaround.  Eventually the back-end should allow us to send same identity value from GET
      if (siteConfigArm.identity) {
        delete siteConfigArm.identity;
      }

      // level: site/config/web
      const webConfigArm: ArmObj<any> = JSON.parse(JSON.stringify(this._webConfigArm));
      webConfigArm.properties = {};

      // -- non-stack settings --
      if (this.platform64BitSupported) {
        webConfigArm.properties.use32BitWorkerProcess = <boolean>(generalSettingsControls['use32BitWorkerProcess'].value);
      }
      if (this.webSocketsSupported) {
        webConfigArm.properties.webSocketsEnabled = <boolean>(generalSettingsControls['webSocketsEnabled'].value);
      }
      if (this.alwaysOnSupported) {
        webConfigArm.properties.alwaysOn = <boolean>(generalSettingsControls['alwaysOn'].value);
      }
      if (this.classicPipelineModeSupported) {
        webConfigArm.properties.managedPipelineMode = <string>(generalSettingsControls['managedPipelineMode'].value);
      }
      if (this.remoteDebuggingSupported) {
        webConfigArm.properties.remoteDebuggingEnabled = <boolean>(generalSettingsControls['remoteDebuggingEnabled'].value);
        webConfigArm.properties.remoteDebuggingVersion = <string>(generalSettingsControls['remoteDebuggingVersion'].value);
      }
      if (this.autoSwapSupported) {
        const autoSwapEnabled = <boolean>(generalSettingsControls['autoSwapEnabled'].value);
        webConfigArm.properties.autoSwapSlotName = autoSwapEnabled ? <string>(generalSettingsControls['autoSwapSlotName'].value) : '';
      }

      // -- stacks settings --
      if (this.netFrameworkSupported) {
        webConfigArm.properties.netFrameworkVersion = <string>(generalSettingsControls['netFrameworkVersion'].value);
      }
      if (this.phpSupported) {
        webConfigArm.properties.phpVersion = <string>(generalSettingsControls['phpVersion'].value);
      }
      if (this.pythonSupported) {
        webConfigArm.properties.pythonVersion = <string>(generalSettingsControls['pythonVersion'].value);
      }
      if (this.javaSupported) {
        webConfigArm.properties.javaVersion = <string>(generalSettingsControls['javaMinorVersion'].value) || <string>(generalSettingsControls['javaVersion'].value) || '';
        const javaWebContainerProperties: JavaWebContainerProperties = JSON.parse(<string>(generalSettingsControls['javaWebContainer'].value));
        webConfigArm.properties.javaContainer = !webConfigArm.properties.javaVersion ? '' : (javaWebContainerProperties.container || '');
        webConfigArm.properties.javaContainerVersion = !webConfigArm.properties.javaVersion ? '' : (javaWebContainerProperties.containerMinorVersion || javaWebContainerProperties.containerMajorVersion || '');
      }
      if (this.linuxRuntimeSupported) {
        webConfigArm.properties.linuxFxVersion = <string>(generalSettingsControls['linuxFxVersion'].value);
        webConfigArm.properties.appCommandLine = <string>(generalSettingsControls['appCommandLine'].value);
      }

      return Observable.zip(
        this._cacheService.putArm(`${this.resourceId}`, null, siteConfigArm),
        this._cacheService.patchArm(`${this.resourceId}/config/web`, null, webConfigArm),
        (c, w) => ({ siteConfigResponse: c, webConfigResponse: w })
      )
        .map(r => {
          this.siteArm = r.siteConfigResponse.json();
          this._webConfigArm = r.webConfigResponse.json();
          return {
            success: true,
            error: null
          };
        })
        .catch(error => {
          this._saveError = error._body;
          return Observable.of({
            success: false,
            error: error._body
          });
        });
    } else {
      let failureMessage = this._validationFailureMessage();
      this._saveError = failureMessage;
      return Observable.of({
        success: false,
        error: failureMessage
      });
    }
  }

  private _validationFailureMessage(): string {
    const configGroupName = this._translateService.instant(PortalResources.feature_generalSettingsName);
    return this._translateService.instant(PortalResources.configUpdateFailureInvalidInput, { configGroupName: configGroupName });
  }
}
