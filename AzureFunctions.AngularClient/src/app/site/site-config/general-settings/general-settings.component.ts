import { Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';

import { Site } from 'app/shared/models/arm/site';
import { SiteConfig } from 'app/shared/models/arm/site-config';
import { AvailableStackNames, AvailableStack, MinorVersion, MajorVersion, Framework } from 'app/shared/models/arm/stacks';
import { DropDownComponent } from './../../../drop-down/drop-down.component';
import { DropDownElement } from './../../../shared/models/drop-down-element';
import { RadioSelectorComponent } from './../../../radio-selector/radio-selector.component';
import { SelectOption } from './../../../shared/models/select-option';

import { SaveResult } from './../site-config.component';
import { AiService } from './../../../shared/services/ai.service';
import { PortalResources } from './../../../shared/models/portal-resources';
import { BusyStateComponent } from './../../../busy-state/busy-state.component';
import { BusyStateScopeManager } from './../../../busy-state/busy-state-scope-manager';
import { TabsComponent } from './../../../tabs/tabs.component';
import { ArmObj, ArmArrayResult } from './../../../shared/models/arm/arm-obj';
import { CacheService } from './../../../shared/services/cache.service';
import { AuthzService } from './../../../shared/services/authz.service';

export class JavaWebContainerProperties {
  container: string;
  containerMajorVersion: string;
  containerMinorVersion: string;
}

export class JavaSettingsControls {
  majorVersion: FormControl;
  minorVersion: FormControl;
  webContainer: FormControl;
}

export class GeneralSettingsControls {
  clientAffinityEnabled: FormControl;
  use32BitWorkerProcess: FormControl;
  webSocketsEnabled: FormControl;
  alwaysOn: FormControl;
  managedPipelineMode: FormControl;
  remoteDebuggingEnabled: FormControl;
  remoteDebuggingVersion: FormControl;
}

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

  private _busyState: BusyStateComponent;
  private _busyStateScopeManager: BusyStateScopeManager;

  private _saveErrorSiteConfig: string;
  private _saveErrorWebConfig: string;

  private _webConfigArm: ArmObj<SiteConfig>;
  private _siteConfigArm: ArmObj<Site>;
  public loadingStateMessage: string;

  private _sku: string;
  private _kind: string;

  private _availableStacksArm: ArmArrayResult<AvailableStack>;

  public clientAffinityEnabledOptions: SelectOption<boolean>[];
  public use32BitWorkerProcessOptions: SelectOption<boolean>[];
  public webSocketsEnabledOptions: SelectOption<boolean>[];
  public alwaysOnOptions: SelectOption<boolean>[];
  public managedPipelineModeOptions: SelectOption<number>[];
  public remoteDebuggingEnabledOptions: SelectOption<boolean>[];
  public remoteDebuggingVersionOptions: SelectOption<string>[];
  private _remoteDebuggingSubscription: RxSubscription;


  private _emptyJavaWebContainerProperties: JavaWebContainerProperties = { container: "-", containerMajorVersion: "", containerMinorVersion: "" };

  private _versionOptionsMap: { [key: string]: DropDownElement<string>[] };
  private _javaMinorVersionOptionsMap: { [key: string]: DropDownElement<string>[] };
  private _javaMinorToMajorVersionsMap: { [key: string]: string };

  private _selectedJavaVersion: string;
  private _javaVersionSubscription: RxSubscription;

  public phpSupported: boolean = false;
  public pythonSupported: boolean = false;
  public javaSupported: boolean = false;
  public platform64BitSupported: boolean = false;
  public webSocketsSupported: boolean = false;
  public alwaysOnSupported: boolean = false;
  public classicPipelineModeSupported: boolean = false;
  public clientAffinitySupported: boolean = false;

  @Input() mainForm: FormGroup;

  @Input() resourceId: string;

  @ViewChild("javaVersionDropDown") _javaVersionDropDown: DropDownComponent<string>;
  @ViewChild("remoteDebuggingRadioButton") _remoteDebuggingRadioButton: RadioSelectorComponent<boolean>;

  constructor(
    private _cacheService: CacheService,
    private _fb: FormBuilder,
    private _translateService: TranslateService,
    private _aiService: AiService,
    private _authZService: AuthzService,
    tabsComponent: TabsComponent
  ) {
    this._busyState = tabsComponent.busyState;
    this._busyStateScopeManager = this._busyState.getScopeManager();

    this._resetPermissionsAndLoadingState();

    this._generateRadioOptions();

    this._resourceIdStream = new Subject<string>();
    this._resourceIdSubscription = this._resourceIdStream
      .distinctUntilChanged()
      .switchMap(() => {
        this._busyStateScopeManager.setBusy();
        this._saveErrorSiteConfig = null;
        this._saveErrorWebConfig = null;
        this._siteConfigArm = null;
        this._webConfigArm = null;
        this.group = null;
        this._clearChildSubscriptions();
        this._resetSupportedControls();
        this._resetPermissionsAndLoadingState();
        return Observable.zip(
          this._authZService.hasPermission(this.resourceId, [AuthzService.writeScope]),
          this._authZService.hasReadOnlyLock(this.resourceId),
          (wp, rl) => ({ writePermission: wp, readOnlyLock: rl })
        )
      })
      .mergeMap(p => {
        this._setPermissions(p.writePermission, p.readOnlyLock);
        return Observable.zip(
          Observable.of(this.hasWritePermissions),
          this._cacheService.getArm(`${this.resourceId}`, true),
          this._cacheService.getArm(`${this.resourceId}/config/web`, true),
          !this._availableStacksArm ? this._cacheService.getArm(`/providers/Microsoft.Web/availablestacks`, true) : Observable.of(null),
          (h, c, w, s) => ({ hasWritePermissions: h, siteConfigResponse: c, webConfigResponse: w, availableStacksResponse: s })
        )
      })
      .do(null, error => {
        this._aiService.trackEvent("/errors/general-settings", error);
        this._setupForm(this._webConfigArm, this._siteConfigArm);
        this.loadingStateMessage = this._translateService.instant(PortalResources.configLoadFailure);
        this._busyStateScopeManager.clearBusy();
      })
      .retry()
      .subscribe(r => {
        this._siteConfigArm = r.siteConfigResponse.json();
        this._webConfigArm = r.webConfigResponse.json();
        this._availableStacksArm = this._availableStacksArm || r.availableStacksResponse.json();
        if (!this._versionOptionsMap) { this._parseAvailableStacks(this._availableStacksArm); }
        this._processSkuAndKind(this._siteConfigArm);
        this._setupForm(this._webConfigArm, this._siteConfigArm);
        this._busyStateScopeManager.clearBusy();
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['resourceId']) {
      this._resourceIdStream.next(this.resourceId);
    }
    if (changes['mainForm'] && !changes['resourceId']) {
      this._setupForm(this._webConfigArm, this._siteConfigArm);
    }
  }

  ngOnDestroy(): void {
    if (this._resourceIdSubscription) { this._resourceIdSubscription.unsubscribe(); this._resourceIdSubscription = null; }
    this._clearChildSubscriptions();
    this._busyStateScopeManager.dispose();
  }

  private _resetPermissionsAndLoadingState() {
    this.hasWritePermissions = true;
    this.permissionsMessage = "";
    this.showPermissionsMessage = false;
    this.showReadOnlySettingsMessage = this._translateService.instant(PortalResources.configViewReadOnlySettings);
    this.loadingStateMessage = this._translateService.instant(PortalResources.loading);
  }

  private _setPermissions(writePermission: boolean, readOnlyLock: boolean) {
    if (!writePermission) {
      this.permissionsMessage = this._translateService.instant(PortalResources.configRequiresWritePermissionOnApp);
    }
    else if (readOnlyLock) {
      this.permissionsMessage = this._translateService.instant(PortalResources.configDisabledReadOnlyLockOnApp);
    }
    else {
      this.permissionsMessage = "";
    }

    this.hasWritePermissions = writePermission && !readOnlyLock;
  }

  private _setupChildSubscriptions() {
    this._clearChildSubscriptions();
    if (!!this.group) {
      if (!this._javaVersionSubscription && !!this._javaVersionDropDown) {
        this._javaVersionSubscription = this._javaVersionDropDown.value.subscribe(javaVersion => {
          this._updateJavaOptions(javaVersion);
        });
      }
      if (!this._remoteDebuggingSubscription && !!this._remoteDebuggingRadioButton) {
        this._remoteDebuggingSubscription = this._remoteDebuggingRadioButton.value.subscribe(enabled => {
          this._setControlsEnabledState(["remoteDebuggingVersion"], enabled);
        })
      }
    }
  }

  private _clearChildSubscriptions() {
    if (this._javaVersionSubscription) { this._javaVersionSubscription.unsubscribe(); this._javaVersionSubscription = null; }
    if (this._remoteDebuggingSubscription) { this._remoteDebuggingSubscription.unsubscribe(); this._remoteDebuggingSubscription = null; }
  }

  private _resetSupportedControls() {
    this.phpSupported = false;
    this.pythonSupported = false;
    this.javaSupported = false;
    this.platform64BitSupported = false;
    this.webSocketsSupported = false;
    this.alwaysOnSupported = false;
    this.classicPipelineModeSupported = false;
    this.clientAffinitySupported = false;
  }

  private _processSkuAndKind(siteConfigArm: ArmObj<Site>)
  {
    if (!!siteConfigArm) {
      let phpSupported = true;
      let pythonSupported = true;
      let javaSupported = true;
      let platform64BitSupported = true;
      let webSocketsSupported = true;
      let alwaysOnSupported = true;
      let classicPipelineModeSupported = true;
      let clientAffinitySupported = true;

      this._sku = siteConfigArm.properties.sku;
      this._kind = siteConfigArm.kind;

      if (this._kind === "functionapp") {
        phpSupported = false;
        pythonSupported = false;
        javaSupported = false;
        classicPipelineModeSupported = false;

        if (this._sku === "Dynamic") {
          webSocketsSupported = false;
          alwaysOnSupported = false;
          clientAffinitySupported = false;
        }
      }
      if (this._sku === "Free" || this._sku === "Shared") {
        platform64BitSupported = false;
        alwaysOnSupported = false;
      }

      this.phpSupported = phpSupported;
      this.pythonSupported = pythonSupported;
      this.javaSupported = javaSupported;
      this.platform64BitSupported = platform64BitSupported;
      this.webSocketsSupported = webSocketsSupported;
      this.alwaysOnSupported = alwaysOnSupported;
      this.classicPipelineModeSupported = classicPipelineModeSupported;
      this.clientAffinitySupported = clientAffinitySupported;
    }
  }

  private _setupForm(webConfigArm: ArmObj<SiteConfig>, siteConfigArm: ArmObj<Site>) {
    this.showPermissionsMessage = false;

    if (!!webConfigArm && !!siteConfigArm) {

      this._clearChildSubscriptions();

      if (!this.group || !this._saveErrorSiteConfig || !this._saveErrorWebConfig) {

        let needsRebuild = false;
        if (!this.group || (!this._saveErrorSiteConfig && !this._saveErrorWebConfig)) {
          this.group = this._fb.group({});
          needsRebuild = true;
        }

        if (needsRebuild || !this._saveErrorSiteConfig) {
          this._setupSiteConfigSettings(this.group, siteConfigArm);
        }

        if (needsRebuild || !this._saveErrorWebConfig) {
          this._setupWebConfigSettings(this.group, webConfigArm);
          this._setupNetFramworkVersion(this.group, webConfigArm.properties.netFrameworkVersion);
          this._setupPhpVersion(this.group, webConfigArm.properties.phpVersion);
          this._setupPythonVersion(this.group, webConfigArm.properties.pythonVersion);
          this._setupJava(this.group, webConfigArm.properties.javaVersion, webConfigArm.properties.javaContainer, webConfigArm.properties.javaContainerVersion);
        }

      }

      if (this.mainForm.contains("generalSettings")) {
        this.mainForm.setControl("generalSettings", this.group);
      }
      else {
        this.mainForm.addControl("generalSettings", this.group);
      }

      setTimeout(() => { this._setupChildSubscriptions(); }, 0);

      setTimeout(() => { this._setEnabledStackControls(); }, 0);

    }
    else {

      this.group = null;

      if (this.mainForm.contains("generalSettings")) {
        this.mainForm.removeControl("generalSettings");
      }

    }

    this._saveErrorSiteConfig = null;
    this._saveErrorWebConfig = null;

    this.showPermissionsMessage = true;
  }

  private _setControlsEnabledState(names: string[], enabled: boolean) {
    if (!!this.group && !!names) {
      names.forEach(name => {
        if (!!this.group.controls[name]) {
          if (enabled) {
            this.group.controls[name].enable();
          }
          else {
            this.group.controls[name].disable();
          }
        }
      })
    }
  }

  private _setEnabledStackControls() {
    this._setControlsEnabledState(["netFrameWorkVersion"], !this._selectedJavaVersion);
    if (this.phpSupported) {
      this._setControlsEnabledState(["phpVersion"], !this._selectedJavaVersion);
    }
    if (this.pythonSupported) {
      this._setControlsEnabledState(["pythonVersion"], !this._selectedJavaVersion);
    }
    if (this.javaSupported) {
      this._setControlsEnabledState(["javaVersion"], true);
      this._setControlsEnabledState(["javaMinorVersion", "javaWebContainer"], !!this._selectedJavaVersion);
    }
  }

  private _generateRadioOptions() {
    let onString = this._translateService.instant(PortalResources.on);
    let offString = this._translateService.instant(PortalResources.off);

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
      [{ displayLabel: "2012", value: "VS2012" },
       { displayLabel: "2013", value: "VS2013" },
       { displayLabel: "2015", value: "VS2015" },
       { displayLabel: "2017", value: "VS2017" }];
  }

  private _setupSiteConfigSettings(group: FormGroup, siteConfigArm: ArmObj<Site>) {
    if (this.clientAffinitySupported) { group.addControl("clientAffinityEnabled", this._fb.control(siteConfigArm.properties.clientAffinityEnabled)); }
  }

  private _setupWebConfigSettings(group: FormGroup, webConfigArm: ArmObj<SiteConfig>) {
    if (this.platform64BitSupported) { group.addControl("use32BitWorkerProcess", this._fb.control(webConfigArm.properties.use32BitWorkerProcess)); }
    if (this.webSocketsSupported) { group.addControl("webSocketsEnabled", this._fb.control(webConfigArm.properties.webSocketsEnabled)); }
    if (this.alwaysOnSupported) { group.addControl("alwaysOn", this._fb.control(webConfigArm.properties.alwaysOn)); }    
    if (this.classicPipelineModeSupported) { group.addControl("managedPipelineMode", this._fb.control(webConfigArm.properties.managedPipelineMode)); }
    group.addControl("remoteDebuggingEnabled", this._fb.control(webConfigArm.properties.remoteDebuggingEnabled));
    group.addControl("remoteDebuggingVersion", this._fb.control(webConfigArm.properties.remoteDebuggingVersion));
    setTimeout(() => { this._setControlsEnabledState(["remoteDebuggingVersion"], webConfigArm.properties.remoteDebuggingEnabled); }, 0);
  }

  private _setupNetFramworkVersion(group: FormGroup, netFrameworkVersion: string) {
    let defaultValue = "";

    let netFrameworkVersionOptions: DropDownElement<string>[] = [];
    let netFrameworkVersionOptionsClean = this._versionOptionsMap[AvailableStackNames.NetStack];

    netFrameworkVersionOptionsClean.forEach(element => {
      let match = element.value === netFrameworkVersion || (!element.value && !netFrameworkVersion);
      defaultValue = match ? element.value : defaultValue;

      netFrameworkVersionOptions.push({
        displayLabel: element.displayLabel,
        value: element.value,
        default: match
      });
    })

    let netFrameWorkVersionControl = this._fb.control(defaultValue);
    (<any>netFrameWorkVersionControl).options = netFrameworkVersionOptions;

    group.addControl("netFrameWorkVersion", netFrameWorkVersionControl);
  }

  private _setupPhpVersion(group: FormGroup, phpVersion: string) {
    if (this.phpSupported) {

      let defaultValue = "";

      let phpVersionOptions: DropDownElement<string>[] = [];
      let phpVersionOptionsClean = this._versionOptionsMap[AvailableStackNames.PhpStack];

      phpVersionOptionsClean.forEach(element => {
        let match = element.value === phpVersion || (!element.value && !phpVersion);
        defaultValue = match ? element.value : defaultValue;

        phpVersionOptions.push({
          displayLabel: element.displayLabel,
          value: element.value,
          default: match
        });
      })

      let phpVersionControl = this._fb.control(defaultValue);
      (<any>phpVersionControl).options = phpVersionOptions;

      group.addControl("phpVersion", phpVersionControl);

    }
  }

  private _setupPythonVersion(group: FormGroup, pythonVersion: string) {
    if (this.pythonSupported) {

      let defaultValue = "";

      let pythonVersionOptions: DropDownElement<string>[] = [];
      let pythonVersionOptionsClean = this._versionOptionsMap[AvailableStackNames.PythonStack];

      pythonVersionOptionsClean.forEach(element => {
        let match = element.value === pythonVersion || (!element.value && !pythonVersion);
        defaultValue = match ? element.value : defaultValue;

        pythonVersionOptions.push({
          displayLabel: element.displayLabel,
          value: element.value,
          default: match
        });
      })

      let pythonVersionControl = this._fb.control(defaultValue);
      (<any>pythonVersionControl).options = pythonVersionOptions;

      group.addControl("pythonVersion", pythonVersionControl);

    }
  }

  private _setupJava(group: FormGroup, javaVersion: string, javaContainer: string, javaContainerVersion: string) {
    if (this.javaSupported) {

      let defaultJavaMinorVersion = "";
      let javaMinorVersionOptions: DropDownElement<string>[] = [];

      let defaultJavaVersion = "";
      let javaVersionOptions: DropDownElement<string>[] = [];
      let javaVersionOptionsClean = this._versionOptionsMap[AvailableStackNames.JavaStack];

      let defaultJavaWebContainer = JSON.stringify(this._emptyJavaWebContainerProperties);
      let javaWebContainerOptions: DropDownElement<string>[] = [];
      let javaWebContainerOptionsClean = this._versionOptionsMap[AvailableStackNames.JavaContainer];

      if (javaVersion) {
        if (this._javaMinorVersionOptionsMap[javaVersion]) {
          defaultJavaVersion = javaVersion;
        }
        else if (this._javaMinorToMajorVersionsMap[javaVersion]) {
          defaultJavaVersion = this._javaMinorToMajorVersionsMap[javaVersion];
          defaultJavaMinorVersion = javaVersion;
        }
        else {
          //TODO: How to handle an invalid javaVersion string
          //javaVersion = "";
        }
      }

      //MajorVersion
      this._selectedJavaVersion = defaultJavaVersion;
      javaVersionOptionsClean.forEach(element => {
        javaVersionOptions.push({
          displayLabel: element.displayLabel,
          value: element.value,
          default: element.value === defaultJavaVersion || (!element.value && !defaultJavaVersion)
        });
      })
      let javaVersionControl = this._fb.control(defaultJavaVersion);
      (<any>javaVersionControl).options = javaVersionOptions;

      //MinorVersion
      if (defaultJavaVersion) {
        this._javaMinorVersionOptionsMap[defaultJavaVersion].forEach(element => {
          javaMinorVersionOptions.push({
            displayLabel: element.displayLabel,
            value: element.value,
            default: element.value === defaultJavaMinorVersion || (!element.value && !defaultJavaMinorVersion)
          });
        })
      }
      else {
        javaMinorVersionOptions = [];
      }

      let javaMinorVersionControl = this._fb.control(defaultJavaMinorVersion);
      (<any>javaMinorVersionControl).options = javaMinorVersionOptions;

      //WebContainer
      if (defaultJavaVersion) {
        javaWebContainerOptionsClean.forEach(element => {
          let match = false;
          let parsedValue: JavaWebContainerProperties = JSON.parse(element.value);
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
        })
      }
      else {
        javaWebContainerOptions = [];
      }

      let javaWebContainerControl = this._fb.control(defaultJavaWebContainer);
      (<any>javaWebContainerControl).options = javaWebContainerOptions;


      group.addControl("javaVersion", javaVersionControl);
      group.addControl("javaMinorVersion", javaMinorVersionControl);
      group.addControl("javaWebContainer", javaWebContainerControl);

    }
  }

  private _updateJavaOptions(javaVersion: string) {
    let previousJavaVersionSelection = this._selectedJavaVersion;
    let javaMinorVersionOptions: DropDownElement<string>[];
    let defaultJavaMinorVersion: string;
    let javaMinorVersionNeedsUpdate: boolean = false;

    let javaWebContainerOptions: DropDownElement<string>[];
    let defaultJavaWebContainer: string;
    let javaWebContainerNeedsUpdate: boolean = false;

    this._selectedJavaVersion = javaVersion;

    if (!javaVersion) {
      if (previousJavaVersionSelection) {
        javaMinorVersionOptions = [];
        defaultJavaMinorVersion = "";
        javaMinorVersionNeedsUpdate = true;

        javaWebContainerOptions = [];
        defaultJavaWebContainer = JSON.stringify(this._emptyJavaWebContainerProperties);
        javaWebContainerNeedsUpdate = true;
      }
    }
    else {
      let javaMinorVersionOptionsClean = this._javaMinorVersionOptionsMap[javaVersion] || [];
      javaMinorVersionOptions = JSON.parse(JSON.stringify(javaMinorVersionOptionsClean));
      javaMinorVersionOptions.forEach(element => {
        element.default = !element.value;
      })
      defaultJavaMinorVersion = "";
      javaMinorVersionNeedsUpdate = true;

      if (!previousJavaVersionSelection) {
        let javaWebContainerOptionsClean = this._versionOptionsMap[AvailableStackNames.JavaContainer];
        javaWebContainerOptions = JSON.parse(JSON.stringify(javaWebContainerOptionsClean));
        javaWebContainerOptions[0].default = true;
        defaultJavaWebContainer = javaWebContainerOptions[0].value;
        javaWebContainerNeedsUpdate = true;
      }
    }

    //MinorVersion
    if (javaMinorVersionNeedsUpdate) {
      let javaMinorVersionControl = this._fb.control(defaultJavaMinorVersion);
      (<any>javaMinorVersionControl).options = javaMinorVersionOptions;

      if (!!this.group.controls["javaMinorVersion"]) {
        this.group.setControl("javaMinorVersion", javaMinorVersionControl);
      }
      else {
        this.group.addControl("javaMinorVersion", javaMinorVersionControl);
      }
      this.group.controls["javaMinorVersion"].markAsDirty();
    }

    //WebContainer
    if (javaWebContainerNeedsUpdate) {
      let javaWebContainerControl = this._fb.control(defaultJavaWebContainer);
      (<any>javaWebContainerControl).options = javaWebContainerOptions;

      if (!!this.group.controls["javaWebContainer"]) {
        this.group.setControl("javaWebContainer", javaWebContainerControl);
      }
      else {
        this.group.addControl("javaWebContainer", javaWebContainerControl);
      }
      this.group.controls["javaWebContainer"].markAsDirty();
    }

    setTimeout(() => { this._setEnabledStackControls(); }, 0);
  }

  private _parseAvailableStacks(availableStacksArm: ArmArrayResult<AvailableStack>) {
    this._availableStacksArm = availableStacksArm;
    this._versionOptionsMap = {};

    this._availableStacksArm.value.forEach(availableStackArm => {
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
    })
  }

  private _parseNetStackOptions(availableStack: AvailableStack) {
    this._versionOptionsMap = this._versionOptionsMap || {};

    let netFrameworkVersionOptions: DropDownElement<string>[] = [];

    availableStack.majorVersions.forEach(majorVersion => {
      netFrameworkVersionOptions.push({
        displayLabel: majorVersion.displayVersion,
        value: majorVersion.runtimeVersion,
        default: false
      });
    })

    this._versionOptionsMap[AvailableStackNames.NetStack] = netFrameworkVersionOptions;
  }

  private _parsePhpStackOptions(availableStack: AvailableStack) {
    this._versionOptionsMap = this._versionOptionsMap || {};

    let phpVersionOptions: DropDownElement<string>[] = [];

    phpVersionOptions.push({
      displayLabel: this._translateService.instant(PortalResources.off),
      value: "",
      default: false
    });

    availableStack.majorVersions.forEach(majorVersion => {
      phpVersionOptions.push({
        displayLabel: majorVersion.displayVersion,
        value: majorVersion.runtimeVersion,
        default: false
      });
    })

    this._versionOptionsMap[AvailableStackNames.PhpStack] = phpVersionOptions;
  }

  private _parsePythonStackOptions(availableStack: AvailableStack) {
    this._versionOptionsMap = this._versionOptionsMap || {};

    let pythonVersionOptions: DropDownElement<string>[] = [];

    pythonVersionOptions.push({
      displayLabel: this._translateService.instant(PortalResources.off),
      value: "",
      default: false
    });

    availableStack.majorVersions.forEach(majorVersion => {
      pythonVersionOptions.push({
        displayLabel: majorVersion.displayVersion,
        value: majorVersion.runtimeVersion,
        default: false
      });
    })

    this._versionOptionsMap[AvailableStackNames.PythonStack] = pythonVersionOptions;
  }

  private _parseJavaStackOptions(availableStack: AvailableStack) {
    this._versionOptionsMap = this._versionOptionsMap || {};
    this._javaMinorToMajorVersionsMap = {};
    this._javaMinorVersionOptionsMap = {};

    let javaVersionOptions: DropDownElement<string>[] = [];

    javaVersionOptions.push({
      displayLabel: this._translateService.instant(PortalResources.off),
      value: "",
      default: false
    });

    availableStack.majorVersions.forEach(majorVersion => {
      this._parseJavaMinorStackOptions(majorVersion);

      javaVersionOptions.push({
        displayLabel: "Java " + majorVersion.displayVersion.substr(2),
        value: majorVersion.runtimeVersion,
        default: false
      });
    })

    this._versionOptionsMap[AvailableStackNames.JavaStack] = javaVersionOptions;
  }

  private _parseJavaMinorStackOptions(majorVersion: MajorVersion) {
    this._javaMinorToMajorVersionsMap = this._javaMinorToMajorVersionsMap || {};
    this._javaMinorVersionOptionsMap = this._javaMinorVersionOptionsMap || {};

    let javaMinorVersionOptions: DropDownElement<string>[] = [];

    majorVersion.minorVersions.forEach(minorVersion => {
      this._javaMinorToMajorVersionsMap[minorVersion.runtimeVersion] = majorVersion.runtimeVersion;
      javaMinorVersionOptions.push({
        displayLabel: minorVersion.displayVersion,
        value: minorVersion.runtimeVersion,
        default: false
      });
    })

    javaMinorVersionOptions.push({
      displayLabel: this._translateService.instant(PortalResources.newest),
      value: "",
      default: false
    });

    this._javaMinorVersionOptionsMap[majorVersion.runtimeVersion] = javaMinorVersionOptions;
  }

  private _parseJavaContainerOptions(availableStack: AvailableStack) {
    this._versionOptionsMap = this._versionOptionsMap || {};

    let javaWebContainerOptions: DropDownElement<string>[] = [];

    availableStack.frameworks.forEach(framework => {

      framework.majorVersions.forEach(majorVersion => {

        majorVersion.minorVersions.forEach(minorVersion => {

          javaWebContainerOptions.push({
            displayLabel: framework.display + " " + minorVersion.displayVersion,
            value: JSON.stringify({ container: framework.name, containerMajorVersion: majorVersion.runtimeVersion, containerMinorVersion: minorVersion.runtimeVersion }),
            default: false
          });

        })

        javaWebContainerOptions.push({
          displayLabel: this._translateService.instant(PortalResources.newest) + " " + framework.display + " " + majorVersion.displayVersion,
          value: JSON.stringify({ container: framework.name, containerMajorVersion: majorVersion.runtimeVersion, containerMinorVersion: "" }),
          default: false
        });

      })

    })

    this._versionOptionsMap[AvailableStackNames.JavaContainer] = javaWebContainerOptions;
  }

  validate() {
  }

  save(): Observable<SaveResult> {
    let generalSettingsControls = this.group.controls;

    if (this.mainForm.valid) {
      //level: site
      let siteConfigArm: ArmObj<Site> = JSON.parse(JSON.stringify(this._siteConfigArm));
      if (this.clientAffinitySupported) {
        let clientAffinityEnabled = <boolean>(generalSettingsControls['clientAffinityEnabled'].value);
        siteConfigArm.properties.clientAffinityEnabled = clientAffinityEnabled;
      }

      //level: site/config/web
      let webConfigArm: ArmObj<SiteConfig> = JSON.parse(JSON.stringify(this._webConfigArm));

      // -- non-stack settings --
      if (this.platform64BitSupported) { webConfigArm.properties.use32BitWorkerProcess = <boolean>(generalSettingsControls['use32BitWorkerProcess'].value); }
      if (this.webSocketsSupported) { webConfigArm.properties.webSocketsEnabled = <boolean>(generalSettingsControls['webSocketsEnabled'].value); }
      if (this.alwaysOnSupported) { webConfigArm.properties.alwaysOn = <boolean>(generalSettingsControls['alwaysOn'].value); }
      if (this.classicPipelineModeSupported) { webConfigArm.properties.managedPipelineMode = <string>(generalSettingsControls['managedPipelineMode'].value); }
      webConfigArm.properties.remoteDebuggingEnabled = <boolean>(generalSettingsControls['remoteDebuggingEnabled'].value);
      webConfigArm.properties.remoteDebuggingVersion = <string>(generalSettingsControls['remoteDebuggingVersion'].value);

      // -- stacks settings --
      webConfigArm.properties.netFrameworkVersion = <string>(generalSettingsControls['netFrameWorkVersion'].value);
      if (this.phpSupported) { webConfigArm.properties.phpVersion = <string>(generalSettingsControls['phpVersion'].value); }
      if (this.pythonSupported) { webConfigArm.properties.pythonVersion = <string>(generalSettingsControls['pythonVersion'].value); }
      if (this.javaSupported) {
        webConfigArm.properties.javaVersion = <string>(generalSettingsControls['javaMinorVersion'].value) || <string>(generalSettingsControls['javaVersion'].value) || "";
        let javaWebContainerProperties: JavaWebContainerProperties = JSON.parse(<string>(generalSettingsControls['javaWebContainer'].value));
        webConfigArm.properties.javaContainer = !webConfigArm.properties.javaVersion ? "" : (javaWebContainerProperties.container || "");
        webConfigArm.properties.javaContainerVersion = !webConfigArm.properties.javaVersion ? "" : (javaWebContainerProperties.containerMinorVersion || javaWebContainerProperties.containerMajorVersion || "");
      }

      
      let siteConfReq =
        this._cacheService.putArm(`${this.resourceId}`, null, siteConfigArm)
        .map(siteConfigResponse => {
          this._siteConfigArm = siteConfigResponse.json();
          return {
            success: true,
            errors: null
          };
        })
        .catch(error => {
          this._saveErrorSiteConfig = error._body;
          return Observable.of({
            success: false,
            errors: [error._body]
          });
        });

      let webConfReq =
        this._cacheService.putArm(`${this.resourceId}/config/web`, null, webConfigArm)
        .map(webConfigResponse => {
          this._webConfigArm = webConfigResponse.json();
          return {
            success: true,
            errors: null
          };
        })
        .catch(error => {
          this._saveErrorWebConfig = error._body;
          return Observable.of({
            success: false,
            errors: [error._body]
          });
        });

      return Observable.zip(
        siteConfReq,
        webConfReq,
        (c, w) => ({ siteConfigSaveResult: c, webConfigSaveResult: w })
      )
      .map(r => {
        let errors = [];
        if (!r.siteConfigSaveResult.success && !! r.siteConfigSaveResult.errors) { errors = errors.concat(r.siteConfigSaveResult.errors); }
        if (!r.webConfigSaveResult.success && !! r.webConfigSaveResult.errors) { errors = errors.concat(r.webConfigSaveResult.errors); }
        return {
          success: r.siteConfigSaveResult.success && r.webConfigSaveResult.success,
          errors: errors
        };
      });

    }
    else {
      let configGroupName = this._translateService.instant(PortalResources.feature_generalSettingsName);
      let failureMessage = this._translateService.instant(PortalResources.configUpdateFailureInvalidInput, { configGroupName: configGroupName });
      return Observable.of({
        success: false,
        errors: [failureMessage]
      });
    }
  }
}