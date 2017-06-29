import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';

import { SiteConfig } from 'app/shared/models/arm/site-config';
import { AvailableStackNames, Version } from 'app/shared/models/constants';
import { AvailableStack, MinorVersion, MajorVersion, Framework } from 'app/shared/models/arm/stacks';
import { StacksHelper } from './../../../shared/Utilities/stacks.helper';



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

@Component({
  selector: 'general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss']
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

  private _netFrameworkVersionOptions: DropDownElement<string>[];
  private _phpVersionOptions: DropDownElement<string>[];
  private _pythonVersionOptions: DropDownElement<string>[];
  private _javaVersionOptions: DropDownElement<string>[];
  private _javaMinorVersionOptions: DropDownElement<string>[];
  private _javaMinorVersionOptionsMap: { [key: string]: DropDownElement<string>[] };
  private _javaWebContainerOptions: DropDownElement<string>[];

  @Input() mainForm: FormGroup;

  @Input() resourceId: string;

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
        this._setupForm(this._webConfigArm, this._availableStacksArm);
        this.loadingStateMessage = this._translateService.instant(PortalResources.configLoadFailure);
        this._busyStateScopeManager.clearBusy();
      })
      .retry()
      .subscribe(r => {
        this._webConfigArm = r.webConfigResponse.json();
        this._availableStacksArm = this._availableStacksArm || r.availableStacksResponse.json();
        this._setupForm(this._webConfigArm, this._availableStacksArm);
        this._busyStateScopeManager.clearBusy();
      });
  }

  ngOnChanges(changes: SimpleChanges){
    if (changes['resourceId']){
      this._resourceIdStream.next(this.resourceId);
    }
    if(changes['mainForm'] && !changes['resourceId']){
      this._setupForm(this._webConfigArm, this._availableStacksArm);
    }
  }

  ngOnDestroy(): void{
    this._resourceIdSubscription.unsubscribe();
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


  private _setupForm(webConfigArm: ArmObj<SiteConfig>, availableStacksArm: ArmArrayResult<AvailableStack>){

    if(!!webConfigArm && !!availableStacksArm){
      if(!this._saveError || !this.group){
        this._generateOrUpdateStacksOptions(availableStacksArm, webConfigArm);

        //netFramworkVersion
        let netFramworkVersionOption = this._netFrameworkVersionOptions.find(t => t.default);
        let netFramworkVersionValue = !!netFramworkVersionOption ? netFramworkVersionOption.value : null;
        let netFrameWorkVersion = this._fb.group({
          value: netFramworkVersionValue
        });
        (<any>netFrameWorkVersion).options = this._netFrameworkVersionOptions;
        (<any>netFrameWorkVersion).friendlyName = ".NET Framework version";
        
        //phpVersion
        let phpVersionOption = this._phpVersionOptions.find(t => t.default);
        let phpVersionValue = !!phpVersionOption ? phpVersionOption.value : null;
        let phpVersion = this._fb.group({
          value: phpVersionValue
        });
        (<any>phpVersion).options = this._phpVersionOptions;
        (<any>phpVersion).friendlyName = "PHP version";
        
        //pythonVersion
        let pythonVersionOption = this._pythonVersionOptions.find(t => t.default);
        let pythonVersionValue = !!pythonVersionOption ? pythonVersionOption.value : null;
        let pythonVersion = this._fb.group({
          value: pythonVersionValue
        });
        (<any>pythonVersion).options = this._pythonVersionOptions;
        (<any>pythonVersion).friendlyName = "Python version";

        //javaVersion
        let javaVersionOption = this._javaVersionOptions.find(t => t.default);
        let javaVersionValue = !!javaVersionOption ? javaVersionOption.value : null;
        let javaVersion = this._fb.group({
          value: javaVersionValue
        });
        (<any>javaVersion).options = this._javaVersionOptions;
        (<any>javaVersion).friendlyName = "Java version";

        //javaMinorVersion
        this._javaMinorVersionOptions = !!javaVersionValue ? this._javaMinorVersionOptionsMap[javaVersionValue] : null;
        let javaMinorVersionOption = this._javaMinorVersionOptions.find(t => t.default);
        let javaMinorVersionValue = !!javaMinorVersionOption ? javaMinorVersionOption.value : null;
        let javaMinorVersion = this._fb.group({
          value: javaMinorVersionValue
        });
        (<any>javaMinorVersion).options = this._javaMinorVersionOptions;
        (<any>javaMinorVersion).friendlyName = "Java minor version";

        //javaWebContainer
        let javaWebContainerOption = this._javaWebContainerOptions.find(t => t.default);
        let javaWebContainerValue = !!javaWebContainerOption ? javaWebContainerOption.value : null;
        let javaWebContainer = this._fb.group({
          value: javaWebContainerValue
        });
        (<any>javaWebContainer).options = this._javaWebContainerOptions;
        (<any>javaWebContainer).friendlyName = "Web container";



        this.group = this._fb.group({
          netFrameWorkVersion: netFrameWorkVersion,
          phpVersion: phpVersion,
          pythonVersion: pythonVersion,
          javaVersion: javaVersion,
          javaMinorVersion: javaMinorVersion,
          javaWebContainer: javaWebContainer
        });
      }
      // else{
      //   setTimeout(this.mainForm.markAsDirty(), 0);
      // }

      if(this.mainForm.contains("generalSettings")){
        this.mainForm.setControl("generalSettings", this.group);
      }
      else{
        this.mainForm.addControl("generalSettings", this.group);
      }
    }
    else{
      this.group = null;
      if(this.mainForm.contains("generalSettings")){
        this.mainForm.removeControl("generalSettings");
      }
    }

    this._saveError = null;

  }

  private _generateOrUpdateStacksOptions(availableStacksArm: ArmArrayResult<AvailableStack>, webConfigArm: ArmObj<SiteConfig>){
    this._availableStacksArm = availableStacksArm;
    this._availableStacksArm.value.forEach(availableStackArm => {
      switch(availableStackArm.name)
      {
        case AvailableStackNames.NetStack:
          this._generateOrUpdateNetStackOptions(availableStackArm.properties, webConfigArm.properties.netFrameworkVersion);
          break;
        case AvailableStackNames.PhpStack:
          this._generateOrUpdatePhpStackOptions(availableStackArm.properties, webConfigArm.properties.phpVersion);
          break;
        case AvailableStackNames.PythonStack:
          this._generateOrUpdatePythonStackOptions(availableStackArm.properties, webConfigArm.properties.pythonVersion);
          break;
        case AvailableStackNames.JavaStack:
          this._generateOrUpdateJavaStackOptions(availableStackArm.properties, webConfigArm.properties.javaVersion);
          break;
        case AvailableStackNames.JavaContainer:
          this._generateOrUpdateJavaContainerOptions(availableStackArm.properties, webConfigArm.properties.javaContainer, webConfigArm.properties.javaContainerVersion);
          break;
        default:
          break;
      }
    })
  }

  private _generateOrUpdateNetStackOptions(availableStack: AvailableStack, netFrameworkVersion: string){
    if(!!this._netFrameworkVersionOptions){
      this._netFrameworkVersionOptions.forEach(element => {
        element.default = element.value === netFrameworkVersion;
      })
    }
    else {
      this._netFrameworkVersionOptions = [];

      availableStack.majorVersions.forEach(majorVersion => {
        this._netFrameworkVersionOptions.push({
          displayLabel: majorVersion.displayVersion,
          value: majorVersion.runtimeVersion,
          default: majorVersion.runtimeVersion === netFrameworkVersion
        });
      })
    }
  }

  private _generateOrUpdatePhpStackOptions(availableStack: AvailableStack, phpVersion: string){
    if(!!this._phpVersionOptions){
      this._phpVersionOptions.forEach(element => {
        element.default = (!element.value && !phpVersion) || element.value === phpVersion;
      })
    }
    else {
      this._phpVersionOptions = [];

      this._phpVersionOptions.push({
        displayLabel: "Off",
        value: "",
        default: !phpVersion
      });

      availableStack.majorVersions.forEach(majorVersion => {
        this._phpVersionOptions.push({
          displayLabel: majorVersion.displayVersion,
          value: majorVersion.runtimeVersion,
          default: majorVersion.runtimeVersion === phpVersion
        });
      })
    }
  }

  private _generateOrUpdatePythonStackOptions(availableStack: AvailableStack, pythonVersion: string){
    if(!!this._pythonVersionOptions){
      this._pythonVersionOptions.forEach(element => {
        element.default = (!element.value && !pythonVersion) || element.value === pythonVersion;
      })
    }
    else {
      this._pythonVersionOptions = [];

      this._pythonVersionOptions.push({
        displayLabel: "Off",
        value: "",
        default: !pythonVersion
      });

      availableStack.majorVersions.forEach(majorVersion => {
        this._pythonVersionOptions.push({
          displayLabel: majorVersion.displayVersion,
          value: majorVersion.runtimeVersion,
          default: majorVersion.runtimeVersion === pythonVersion
        });
      })
    }
  }

  private _generateOrUpdateJavaStackOptions(availableStack: AvailableStack, javaVersion: string){
    let javaMajorVersion: string = javaVersion;
    let match = false;

    if(!!this._javaVersionOptions && !!this._javaMinorVersionOptionsMap){
      for(let majorVersion in this._javaMinorVersionOptionsMap){
        match = this._updateJavaMinorStackOptions(majorVersion, javaVersion);
        javaMajorVersion = match ? majorVersion : javaMajorVersion;
      }
      this._javaVersionOptions.forEach(element => {
        element.default = (!element.value && !javaMajorVersion) || element.value === javaMajorVersion;
      })
    }
    else {
      this._javaVersionOptions = [];
      this._javaMinorVersionOptionsMap =  {};

      this._javaVersionOptions.push({
        displayLabel: "Off",
        value: "",
        default: !javaMajorVersion
      });

      availableStack.majorVersions.forEach(majorVersion => {
        match = this._generateJavaMinorStackOptions(majorVersion, javaVersion);
        javaMajorVersion = match ? majorVersion.runtimeVersion : javaMajorVersion;

        this._javaVersionOptions.push({
          displayLabel: "Java " + majorVersion.displayVersion.substr(2),
          value: majorVersion.runtimeVersion,
          default: majorVersion.runtimeVersion === javaMajorVersion
        });
      })
    }
  }

  private _updateJavaMinorStackOptions(majorVersion: string, javaVersion: string): boolean{
    let match = majorVersion === javaVersion;
    if(!javaVersion || match){
      this._javaMinorVersionOptionsMap[majorVersion].forEach(element => {
        element.default = !element.value;
      })
    }
    else{
      this._javaMinorVersionOptionsMap[majorVersion].forEach(element => {
        element.default = element.value === javaVersion;
        match = match || element.default;
      })
    }
    return match;
  }

  private _generateJavaMinorStackOptions(majorVersion: MajorVersion, javaVersion: string): boolean{
    let match = false;
    let javaMinorVersionOptions: DropDownElement<string>[] = [];

    majorVersion.minorVersions.forEach(minorVersion => {
      let isDefault = false;
      if(minorVersion.runtimeVersion === javaVersion){
        isDefault = true;
        match = true;
      }

      javaMinorVersionOptions.push({
        displayLabel: minorVersion.displayVersion,
        value: minorVersion.runtimeVersion,
        default: isDefault
      });
    })

    javaMinorVersionOptions.push({
      displayLabel: "Newest",
      value: "",
      default: !match
    });
    
    this._javaMinorVersionOptionsMap[majorVersion.runtimeVersion] = javaMinorVersionOptions;

    return match;
  }

  private _generateOrUpdateJavaContainerOptions(availableStack: AvailableStack, javaContainer: string, javaContainerVersion: string){
    if(!!this._javaWebContainerOptions){
      this._javaWebContainerOptions.forEach(element => {
        let parsedValue = JSON.parse(element.value);
        element.default = parsedValue.container.toUpperCase() === javaContainer && (parsedValue.majorVersion === javaContainerVersion || parsedValue.minorVersion === javaContainerVersion);
      })
    }
    else {
      let javaContainerMajorVersion: string = javaContainerVersion;

      this._javaWebContainerOptions = [];

      availableStack.frameworks.forEach(framework => {

        framework.majorVersions.forEach(majorVersion => {
          let match = false;
          
          majorVersion.minorVersions.forEach(minorVersion => {
            let isDefault = false;
            if(framework.name.toUpperCase() === javaContainer && minorVersion.runtimeVersion === javaContainerVersion){
              isDefault = true;
              match = true;
              javaContainerMajorVersion = majorVersion.runtimeVersion;
            }

            this._javaWebContainerOptions.push({
              displayLabel: framework.display + " " + minorVersion.displayVersion,
              value: JSON.stringify({container: framework.name, majorVersion: majorVersion.runtimeVersion, minorVersion: minorVersion.runtimeVersion}),
              default: isDefault
            });

          })

          this._javaWebContainerOptions.push({
              displayLabel: "Newest " + framework.display + " " + majorVersion.displayVersion,
              value: JSON.stringify({container: framework.name, majorVersion: majorVersion.runtimeVersion, minorVersion: ""}),
              default: !match
          });

        })

      })
    }
  }

  validate(){
  }

  save() : Observable<SaveResult>{
    let generalSettingsControls = this.group.controls;

    if(this.mainForm.valid){
      let webConfigArm: ArmObj<SiteConfig> = JSON.parse(JSON.stringify(this._webConfigArm));

      let netFrameWorkVersion = <string>(generalSettingsControls['netFrameWorkVersion'].value.value);
      let phpVersion = <string>(generalSettingsControls['phpVersion'].value.value);
      let javaVersion = <string>(generalSettingsControls['javaVersion'].value.value);
      let pythonVersion = <string>(generalSettingsControls['pythonVersion'].value.value);

      // webConfigArm.properties.netFrameworkVersion = this.nullIfOff(netFrameWorkVersion);
      // webConfigArm.properties.phpVersion = this.nullIfOff(phpVersion);
      // webConfigArm.properties.javaVersion = this.nullIfOff(javaVersion);
      // webConfigArm.properties.pythonVersion = this.nullIfOff(pythonVersion);

      webConfigArm.properties.netFrameworkVersion = netFrameWorkVersion;
      webConfigArm.properties.phpVersion = phpVersion;
      webConfigArm.properties.javaVersion = javaVersion;
      webConfigArm.properties.pythonVersion = pythonVersion;

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

  private nullIfOff(value: string): string{
    return value == "Off" ? "" : value;
  }

  //discard(){
  //  this.group.reset();
  //  this._setupForm(this._webConfigArm);
  //}
}