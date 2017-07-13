import { Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';

import { SiteConfig } from 'app/shared/models/arm/site-config';
import { AvailableStackNames, Version } from 'app/shared/models/constants';
import { AvailableStack, MinorVersion, MajorVersion, Framework } from 'app/shared/models/arm/stacks';
import { StacksHelper } from './../../../shared/Utilities/stacks.helper';
import { DropDownComponent } from './../../../drop-down/drop-down.component';


import { SaveResult } from './../site-config.component';
import { AiService } from './../../../shared/services/ai.service';
import { PortalResources } from './../../../shared/models/portal-resources';
import { DropDownElement } from './../../../shared/models/drop-down-element';
import { BusyStateComponent } from './../../../busy-state/busy-state.component';
import { BusyStateScopeManager } from './../../../busy-state/busy-state-scope-manager';
import { TabsComponent } from './../../../tabs/tabs.component';
import { CustomFormControl, CustomFormGroup } from './../../../controls/click-to-edit/click-to-edit.component';
import { ArmObj, ArmArrayResult } from './../../../shared/models/arm/arm-obj';
import { TblItem } from './../../../controls/tbl/tbl.component';
import { CacheService } from './../../../shared/services/cache.service';
import { AuthzService } from './../../../shared/services/authz.service';
//import { UniqueValidator } from 'app/shared/validators/uniqueValidator';
//import { RequiredValidator } from 'app/shared/validators/requiredValidator';

export class JavaWebContainerProperties {
  container: string;
  containerMajorVersion: string;
  containerMinorVersion: string;
}

export class JavaSettingsGroups {
  majorVersion: FormGroup;
  minorVersion: FormGroup;
  webContainer: FormGroup;
}

@Component({
  selector: 'general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./../site-config.component.scss']
  //styleUrls: ['./general-settings.component.scss']
})
export class GeneralSettingsComponent implements OnChanges, OnDestroy {
  public Resources = PortalResources;
  public group: FormGroup;

  private _resourceIdStream: Subject<string>;
  private _resourceIdSubscription: RxSubscription;
  private _writePermission: boolean;
  private _readOnlyLock: boolean;
  public hasWritePermissions: boolean;
  public permissionsMessage: string;

  private _busyState: BusyStateComponent;
  private _busyStateScopeManager: BusyStateScopeManager;
 
  private _authZService: AuthzService;

  private _saveError: string;

  //private _requiredValidator: RequiredValidator;
  //private _uniqueAppSettingValidator: UniqueValidator;

  private _webConfigArm: ArmObj<SiteConfig>;
  public loadingStateMessage: string;

  private _usingCustomContainer: boolean;
  private _isLinux: boolean;
  private _isDynamicSku: boolean;
  private _isFunctionApp: boolean;

  // private _workerProcess64BitEnabled = false;
  // private _webSocketsEnabled = false;


  private _availableStacksArm: ArmArrayResult<AvailableStack>;
  //private _javaMajorToMinorMap: Map<string, MinorVersion[]>;

  private _emptyJavaWebContainerProperties: JavaWebContainerProperties = { container: "-", containerMajorVersion: "", containerMinorVersion: "" };
  private _emptyJavaWebContainerOptions: DropDownElement<string>[] = [{ displayLabel: "-", value: JSON.stringify(this._emptyJavaWebContainerProperties), default: true }];
  private _emptyJavaMinorVersionOptions: DropDownElement<string>[] = [{ displayLabel: "-", value: "", default: true }];
  
  private _versionOptionsMap: { [key: string]: DropDownElement<string>[] };
  private _javaMinorVersionOptionsMap: { [key: string]: DropDownElement<string>[] };

  private _selectedJavaVersion: string;
  private _javaVersionSubscription: RxSubscription;

  @Input() mainForm: FormGroup;

  @Input() resourceId: string;

  @ViewChild("javaVersionDropDown") _javaVersionDropDown : DropDownComponent<string>;

  constructor(
    private _cacheService: CacheService,
    private _fb: FormBuilder,
    private _translateService: TranslateService,
    private _aiService: AiService,
    authZService: AuthzService,
    tabsComponent: TabsComponent
    ) {
      this._busyState = tabsComponent.busyState;
      this._busyStateScopeManager = this._busyState.getScopeManager();
      
      this._authZService = authZService;

      this._resetPermissionsAndLoadingState();

      this._resourceIdStream = new Subject<string>();
      this._resourceIdSubscription = this._resourceIdStream
      .distinctUntilChanged()
      .switchMap(() => {
        this._busyStateScopeManager.setBusy();
        this._saveError = null;
        this._webConfigArm = null;
        this.group = null;
        this._resetPermissionsAndLoadingState();
        return Observable.zip(
          this._authZService.hasPermission(this.resourceId, [AuthzService.writeScope]),
          this._authZService.hasReadOnlyLock(this.resourceId),
          (wp, rl) => ({writePermission: wp, readOnlyLock: rl})
        )
      })
      .mergeMap(p => {
        this._setPermissions(p.writePermission, p.readOnlyLock);
        return Observable.zip(
          Observable.of(this.hasWritePermissions),
          this._cacheService.getArm(`${this.resourceId}/config/web`, true),
          !this._availableStacksArm ? this._cacheService.getArm(`/providers/Microsoft.Web/availablestacks`, true) : Observable.of(null),
          (h, w, s) => ({hasWritePermissions: h, webConfigResponse: w, availableStacksResponse: s})
        )
      })
      .do(null, error => {
        this._aiService.trackEvent("/errors/general-settings", error);
        //this._webConfigArm = null;
        this._setupForm(this._webConfigArm);
        this.loadingStateMessage = this._translateService.instant(PortalResources.configLoadFailure);
        this._busyStateScopeManager.clearBusy();
      })
      .retry()
      .subscribe(r => {
        this._webConfigArm = r.webConfigResponse.json();
        this._availableStacksArm = this._availableStacksArm || r.availableStacksResponse.json();
        if(!this._versionOptionsMap){
          this._parseAvailableStacks(this._availableStacksArm);
        }
        this._setupForm(this._webConfigArm);
        //setTimeout(() => { this._setupJavaVersionSubscription(); }, 0);
        this._busyStateScopeManager.clearBusy();
      });
  }

  ngOnChanges(changes: SimpleChanges){
    if (changes['resourceId']){
      this._resourceIdStream.next(this.resourceId);
    }
    if(changes['mainForm'] && !changes['resourceId']){
      this._setupForm(this._webConfigArm);
    }
  }

  ngAfterViewInit(){
    // this._javaVersionSubscription = this._javaVersionDropDown.value.subscribe(javaVersion => {
    //   this._updateJavaOptions(javaVersion);
    // });
  }

  ngOnDestroy(): void{
    if(this._resourceIdSubscription) { this._resourceIdSubscription.unsubscribe(); }
    if(this._javaVersionSubscription) { this._javaVersionSubscription.unsubscribe(); }
    this._busyStateScopeManager.dispose();
  }

  private _resetPermissionsAndLoadingState(){
    this._writePermission = true;
    this._readOnlyLock = false;
    this.hasWritePermissions = true;
    this.permissionsMessage = "";
    this.loadingStateMessage = this._translateService.instant(PortalResources.configLoading);
  }

  private _setPermissions(writePermission: boolean, readOnlyLock: boolean){
    this._writePermission = writePermission;
    this._readOnlyLock = readOnlyLock;

    if(!this._writePermission){
      this.permissionsMessage = this._translateService.instant(PortalResources.configRequiresWritePermissionOnApp);
    }
    else if(this._readOnlyLock){
      this.permissionsMessage = this._translateService.instant(PortalResources.configDisabledReadOnlyLockOnApp);
    }
    else{
      this.permissionsMessage = "";
    }

    this.hasWritePermissions = this._writePermission && !this._readOnlyLock;
  }


  private _setupJavaVersionSubscription(){
    if(this._javaVersionSubscription){ this._javaVersionSubscription.unsubscribe(); }
    if(!!this.group)
    {
      this._javaVersionSubscription = this._javaVersionDropDown.value.subscribe(javaVersion => {
        this._updateJavaOptions(javaVersion);
      });
    }
  }

  private _setupForm(webConfigArm: ArmObj<SiteConfig>){
    if(!!webConfigArm){

      if(this._javaVersionSubscription){
        this._javaVersionSubscription.unsubscribe();
      }

      if(!this._saveError || !this.group){
        let netFrameWorkVersion = this._setupNetFramworkVersion(webConfigArm.properties.netFrameworkVersion);
        let phpVersion = this._setupPhpVersion(webConfigArm.properties.phpVersion);
        let pythonVersion = this._setupPythonVersion(webConfigArm.properties.pythonVersion);
        let java: JavaSettingsGroups = this._setupJava(webConfigArm.properties.javaVersion, webConfigArm.properties.javaContainer, webConfigArm.properties.javaContainerVersion);

        this.group = this._fb.group({
          netFrameWorkVersion: netFrameWorkVersion,
          phpVersion: phpVersion,
          pythonVersion: pythonVersion,
          javaVersion: java.majorVersion,
          javaMinorVersion: java.minorVersion,
          javaWebContainer: java.webContainer
        });
      }
        
      if(this.mainForm.contains("generalSettings")){
        this.mainForm.setControl("generalSettings", this.group);
      }
      else{
        this.mainForm.addControl("generalSettings", this.group);
      }

      setTimeout(() => { this._setupJavaVersionSubscription(); }, 0);

    }
    else{

      this.group = null;

      if(this.mainForm.contains("generalSettings")){
        this.mainForm.removeControl("generalSettings");
      }

    }

    this._saveError = null;

  }

  private _setupNetFramworkVersion(netFrameworkVersion: string): FormGroup{
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

    let netFrameWorkVersionGroup = this._fb.group({
      value: defaultValue
    });
    (<any>netFrameWorkVersionGroup).options = netFrameworkVersionOptions;
    (<any>netFrameWorkVersionGroup).friendlyName = ".NET Framework version";

    return netFrameWorkVersionGroup;
  }
  
  private _setupPhpVersion(phpVersion: string): FormGroup{
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

    let phpVersionGroup = this._fb.group({
      value: defaultValue
    });
    (<any>phpVersionGroup).options = phpVersionOptions;
    (<any>phpVersionGroup).friendlyName = "PHP version";

    return phpVersionGroup;
  }
  
  private _setupPythonVersion(pythonVersion: string): FormGroup{
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

    let pythonVersionGroup = this._fb.group({
      value: defaultValue
    });
    (<any>pythonVersionGroup).options = pythonVersionOptions;
    (<any>pythonVersionGroup).friendlyName = "Python version";

    return pythonVersionGroup;
  }

  private _setupJava(javaVersion: string, javaContainer: string, javaContainerVersion: string): JavaSettingsGroups{
    let defaultJavaMinorVersion = "";
    let javaMinorVersionOptions: DropDownElement<string>[] = [];
    
    let defaultJavaVersion = "";
    let javaVersionOptions: DropDownElement<string>[] = [];
    let javaVersionOptionsClean = this._versionOptionsMap[AvailableStackNames.JavaStack];

    let defaultJavaWebContainer = JSON.stringify(this._emptyJavaWebContainerProperties);
    let javaWebContainerOptions: DropDownElement<string>[] = [];
    let javaWebContainerOptionsClean = this._versionOptionsMap[AvailableStackNames.JavaContainer];

    if(javaVersion){
      if(this._javaMinorVersionOptionsMap[javaVersion]){
        defaultJavaVersion = javaVersion;
      }
      else{
        for(let key in this._javaMinorVersionOptionsMap){
          for(let element of this._javaMinorVersionOptionsMap[key]){
            if(javaVersion === element.value){
              defaultJavaMinorVersion = javaVersion
              defaultJavaVersion = key;
              break;
            }
          }
          if(defaultJavaVersion){
            break;
          }
        }
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
    let javaVersionGroup = this._fb.group({
      value: defaultJavaVersion
    });
    (<any>javaVersionGroup).options = javaVersionOptions;
    (<any>javaVersionGroup).friendlyName = "Java version";

    //MinorVersion
    if(defaultJavaVersion){
      this._javaMinorVersionOptionsMap[defaultJavaVersion].forEach(element => {
        javaMinorVersionOptions.push({
          displayLabel: element.displayLabel,
          value: element.value,
          default: element.value === defaultJavaMinorVersion || (!element.value && !defaultJavaMinorVersion)
        });
      })
    }
    else{
      javaMinorVersionOptions = JSON.parse(JSON.stringify(this._emptyJavaMinorVersionOptions));
    }

    let javaMinorVersionGroup = this._fb.group({
      value: defaultJavaMinorVersion
    });
    (<any>javaMinorVersionGroup).options = javaMinorVersionOptions;
    (<any>javaMinorVersionGroup).friendlyName = "Java minor version";


    //WebContainer
    if(defaultJavaVersion){
      javaWebContainerOptionsClean.forEach(element => {
        let match = false;
        let parsedValue: JavaWebContainerProperties = JSON.parse(element.value);
        if(parsedValue.container.toUpperCase() === javaContainer && (parsedValue.containerMajorVersion === javaContainerVersion || parsedValue.containerMinorVersion === javaContainerVersion)){
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
    else{
      javaWebContainerOptions = JSON.parse(JSON.stringify(this._emptyJavaWebContainerOptions));
    }

    let javaWebContainerGroup = this._fb.group({
      value: defaultJavaWebContainer
    });
    (<any>javaWebContainerGroup).options = javaWebContainerOptions;
    (<any>javaWebContainerGroup).friendlyName = "Web container";

    return {
      majorVersion:javaVersionGroup,
      minorVersion:javaMinorVersionGroup,
      webContainer:javaWebContainerGroup
    };

  }

  private _updateJavaOptions(javaVersion: string){
    let previousJavaVersionSelection = this._selectedJavaVersion;
    let javaMinorVersionOptions: DropDownElement<string>[];
    let defaultJavaMinorVersion: string;
    let javaMinorVersionNeedsUpdate: boolean = false;

    let javaWebContainerOptions: DropDownElement<string>[];
    let defaultJavaWebContainer: string;
    let javaWebContainerNeedsUpdate: boolean = false;

    this._selectedJavaVersion = javaVersion;

    if(!javaVersion){
      if(previousJavaVersionSelection){
        javaMinorVersionOptions = JSON.parse(JSON.stringify(this._emptyJavaMinorVersionOptions));
        defaultJavaMinorVersion = "";
        javaMinorVersionNeedsUpdate = true;

        javaWebContainerOptions = JSON.parse(JSON.stringify(this._emptyJavaWebContainerOptions));
        defaultJavaWebContainer = JSON.stringify(this._emptyJavaWebContainerProperties);
        javaWebContainerNeedsUpdate = true;
      }
    }
    else{
      let javaMinorVersionOptionsClean = this._javaMinorVersionOptionsMap[javaVersion] || this._emptyJavaMinorVersionOptions;
      javaMinorVersionOptions = JSON.parse(JSON.stringify(javaMinorVersionOptionsClean));
      javaMinorVersionOptions.forEach(element => {
        element.default = !element.value;
      })
      defaultJavaMinorVersion = "";
      javaMinorVersionNeedsUpdate = true;

      if(!previousJavaVersionSelection){
        let javaWebContainerOptionsClean = this._versionOptionsMap[AvailableStackNames.JavaContainer];
        javaWebContainerOptions = JSON.parse(JSON.stringify(javaWebContainerOptionsClean));
        javaWebContainerOptions[0].default = true;
        defaultJavaWebContainer = javaWebContainerOptions[0].value;
        javaWebContainerNeedsUpdate = true;
      }
    }

    //MinorVersion
    if(javaMinorVersionNeedsUpdate){
      let javaMinorVersionGroup = this._fb.group({
        value: defaultJavaMinorVersion
      });
      (<any>javaMinorVersionGroup).options = javaMinorVersionOptions;
      (<any>javaMinorVersionGroup).friendlyName = "Java minor version";

      if(this.group.contains("javaMinorVersion")){
        this.group.setControl("javaMinorVersion", javaMinorVersionGroup);
      }
      else{
        this.group.addControl("javaMinorVersion", javaMinorVersionGroup);
      }
      (<FormGroup>this.group.controls["javaMinorVersion"]).controls["value"].markAsDirty();
    }

    //WebContainer
    if(javaWebContainerNeedsUpdate){
      let javaWebContainerGroup = this._fb.group({
        value: defaultJavaWebContainer
      });
      (<any>javaWebContainerGroup).options = javaWebContainerOptions;
      (<any>javaWebContainerGroup).friendlyName = "Web container";

      if(this.group.contains("javaWebContainer")){
        this.group.setControl("javaWebContainer", javaWebContainerGroup);
      }
      else{
        this.group.addControl("javaWebContainer", javaWebContainerGroup);
      }
      (<FormGroup>this.group.controls["javaWebContainer"]).controls["value"].markAsDirty();
    }

  }

  private _parseAvailableStacks(availableStacksArm: ArmArrayResult<AvailableStack>){
    this._availableStacksArm = availableStacksArm;
    this._versionOptionsMap = {};
    
    this._availableStacksArm.value.forEach(availableStackArm => {
      switch(availableStackArm.name)
      {
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

  private _parseNetStackOptions(availableStack: AvailableStack){
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

  private _parsePhpStackOptions(availableStack: AvailableStack){
    this._versionOptionsMap = this._versionOptionsMap || {};

    let phpVersionOptions: DropDownElement<string>[] = [];

    phpVersionOptions.push({
      displayLabel: "Off",
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

  private _parsePythonStackOptions(availableStack: AvailableStack){
    this._versionOptionsMap = this._versionOptionsMap || {};

    let pythonVersionOptions: DropDownElement<string>[] = [];

    pythonVersionOptions.push({
      displayLabel: "Off",
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

  private _parseJavaStackOptions(availableStack: AvailableStack){
    this._versionOptionsMap = this._versionOptionsMap || {};
    this._javaMinorVersionOptionsMap = {};

    let javaVersionOptions: DropDownElement<string>[] = [];

    javaVersionOptions.push({
      displayLabel: "Off",
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

  private _parseJavaMinorStackOptions(majorVersion: MajorVersion){
    this._javaMinorVersionOptionsMap = this._javaMinorVersionOptionsMap || {};

    let javaMinorVersionOptions: DropDownElement<string>[] = [];

    majorVersion.minorVersions.forEach(minorVersion => {
      javaMinorVersionOptions.push({
        displayLabel: minorVersion.displayVersion,
        value: minorVersion.runtimeVersion,
        default: false
      });
    })

    javaMinorVersionOptions.push({
      displayLabel: "Newest",
      value: "",
      default: false
    });

    this._javaMinorVersionOptionsMap[majorVersion.runtimeVersion] = javaMinorVersionOptions;
  }

  private _parseJavaContainerOptions(availableStack: AvailableStack){
    this._versionOptionsMap = this._versionOptionsMap || {};

    let javaWebContainerOptions: DropDownElement<string>[] = [];

    availableStack.frameworks.forEach(framework => {

      framework.majorVersions.forEach(majorVersion => {
        
        majorVersion.minorVersions.forEach(minorVersion => {

          javaWebContainerOptions.push({
            displayLabel: framework.display + " " + minorVersion.displayVersion,
            value: JSON.stringify({container: framework.name, containerMajorVersion: majorVersion.runtimeVersion, containerMinorVersion: minorVersion.runtimeVersion}), //TODO
            default: false
          });

        })

        javaWebContainerOptions.push({
            displayLabel: "Newest " + framework.display + " " + majorVersion.displayVersion,
            value: JSON.stringify({container: framework.name, containerMajorVersion: majorVersion.runtimeVersion, containerMinorVersion: ""}), //TODO
            default: false
        });

      })

    })

    this._versionOptionsMap[AvailableStackNames.JavaContainer] = javaWebContainerOptions;
  }

  validate(){
  }

  save() : Observable<SaveResult>{
    let generalSettingsControls = this.group.controls;

    if(this.mainForm.valid){
      let webConfigArm: ArmObj<SiteConfig> = JSON.parse(JSON.stringify(this._webConfigArm));

      let netFrameWorkVersion = <string>(generalSettingsControls['netFrameWorkVersion'].value.value);
      let phpVersion = <string>(generalSettingsControls['phpVersion'].value.value);
      let pythonVersion = <string>(generalSettingsControls['pythonVersion'].value.value);

      let javaVersion = <string>(generalSettingsControls['javaVersion'].value.value);
      let javaMinorVersion = <string>(generalSettingsControls['javaMinorVersion'].value.value);
      javaVersion = javaMinorVersion || javaVersion;

      let javaWebContainer = <string>(generalSettingsControls['javaWebContainer'].value.value);
      let javaWebContainerParsed: JavaWebContainerProperties = JSON.parse(javaWebContainer);
      let javaContainer = javaWebContainerParsed.container;
      let javaContainerVersion = javaWebContainerParsed.containerMinorVersion || javaWebContainerParsed.containerMajorVersion;

      if(!javaVersion){
        javaContainer = "";
        javaContainerVersion = "";
      }

      webConfigArm.properties.netFrameworkVersion = netFrameWorkVersion;
      webConfigArm.properties.phpVersion = phpVersion;
      webConfigArm.properties.pythonVersion = pythonVersion;
      
      // webConfigArm.properties.javaVersion = "1.8";
      // webConfigArm.properties.javaContainer = "TOMCAT";
      // webConfigArm.properties.javaContainerVersion = "7.0.50";

      webConfigArm.properties.javaVersion = javaVersion || "";
      webConfigArm.properties.javaContainer = javaContainer || "";
      webConfigArm.properties.javaContainerVersion = javaContainerVersion || "";

      return this._cacheService.putArm(`${this.resourceId}/config/web`, null, webConfigArm)
      .map(webConfigResponse => {
        this._webConfigArm = webConfigResponse.json();
        return {
          success: true,
          error: null
        };
      })
      .catch(error => {
        //this._webConfigArm = null;
        this._saveError = error._body;
        return Observable.of({
          success: false,
          error: error._body
        });
      });
    }
    else{
      return Observable.of({
        success: false,
        error: "Failed to save App Settings due to invalid input."
      });
    }
  }

  //discard(){
  //  this.group.reset();
  //  this._setupForm(this._webConfigArm);
  //}
}