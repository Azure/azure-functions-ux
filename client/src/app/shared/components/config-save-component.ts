import { Injector, OnDestroy } from '@angular/core';
import { ArmObj, ResourceId } from 'app/shared/models/arm/arm-obj';
import { ApplicationSettings } from 'app/shared/models/arm/application-settings';
import { ConnectionStrings } from 'app/shared/models/arm/connection-strings';
import { Site } from 'app/shared/models/arm/site';
import { SiteConfig } from 'app/shared/models/arm/site-config';
import { SlotConfigNames } from 'app/shared/models/arm/slot-config-names';
import { FeatureComponent } from './feature-component';
import { BusyStateName } from 'app/busy-state/busy-state.component';

export interface ArmSaveConfigs {
  appSettingsArm?: ArmObj<ApplicationSettings>;
  connectionStringsArm?: ArmObj<ConnectionStrings>;
  siteArm?: ArmObj<Site>;
  siteConfigArm?: ArmObj<SiteConfig>;
  slotConfigNamesArm?: ArmObj<SlotConfigNames>;
}

export interface ArmSaveResult<T> {
  success: boolean;
  error?: string;
  value?: ArmObj<T>;
}

export interface ArmSaveResults {
  appSettings?: ArmSaveResult<ApplicationSettings>;
  connectionStrings?: ArmSaveResult<ConnectionStrings>;
  site?: ArmSaveResult<Site>;
  siteConfig?: ArmSaveResult<SiteConfig>;
  slotConfigNames?: ArmSaveResult<SlotConfigNames>;
}

type ConfigType = 'ApplicationSettings' | 'ConnectionStrings' | 'Site' | 'SiteConfig' | 'SlotConfigNames';

interface ConfigState {
  isNeeded: boolean;
  wasSubmitted: boolean;
}

interface ConfigStateMap {
  [key: string]: ConfigState;
}

export abstract class ConfigSaveComponent extends FeatureComponent<ResourceId> implements ArmSaveConfigs, OnDestroy {
  public appSettingsArm: ArmObj<ApplicationSettings>;
  public connectionStringsArm: ArmObj<ConnectionStrings>;
  public siteArm: ArmObj<Site>;
  public siteConfigArm: ArmObj<SiteConfig>;
  public slotConfigNamesArm: ArmObj<SlotConfigNames>;

  protected _saveFailed: boolean;

  private readonly _configTypes: ConfigType[] = ['ApplicationSettings', 'ConnectionStrings', 'Site', 'SiteConfig', 'SlotConfigNames'];

  private _configStates: ConfigStateMap;

  protected abstract get _isPristine(): boolean;

  protected abstract _getConfigsFromForms(saveConfigs: ArmSaveConfigs): ArmSaveConfigs;

  constructor(componentName: string, injector: Injector, configTypesUsed: ConfigType[], busyComponentName?: BusyStateName) {
    super(componentName, injector, busyComponentName);

    this._resetSubmittedStates();

    configTypesUsed.forEach(t => (this._configStates[t].isNeeded = true));
  }

  protected _resetConfigs() {
    this.appSettingsArm = null;
    this.connectionStringsArm = null;
    this.siteArm = null;
    this.siteConfigArm = null;
    this.slotConfigNamesArm = null;
  }

  protected _resetSubmittedStates() {
    this._configTypes.forEach(t => this._setSubmittedState(t, false));
  }

  private _setSubmittedState(configType: ConfigType, submitted: boolean) {
    this._configStates = this._configStates || {};

    if (!this._configStates[configType]) {
      this._configStates[configType] = { isNeeded: submitted, wasSubmitted: submitted };
    } else {
      this._configStates[configType].wasSubmitted = submitted;
    }
  }

  private _checkIfSubmitted(configType: ConfigType): boolean {
    return this._configStates[configType] && this._configStates[configType].wasSubmitted;
  }

  private _checkIfNeeded(configType: ConfigType): boolean {
    return this._configStates[configType] && this._configStates[configType].isNeeded;
  }

  private _checkConfigExistence(configType: ConfigType, sourceConfigs: ArmSaveConfigs): boolean {
    switch (configType) {
      case 'ApplicationSettings':
        return !!sourceConfigs.appSettingsArm;
      case 'ConnectionStrings':
        return !!sourceConfigs.connectionStringsArm;
      case 'Site':
        return !!sourceConfigs.siteArm;
      case 'SiteConfig':
        return !!sourceConfigs.siteConfigArm;
      case 'SlotConfigNames':
        return !!sourceConfigs.slotConfigNamesArm;
      default:
        return false;
    }
  }

  private _assignConfig(configType: ConfigType, sourceConfigs: ArmSaveConfigs, destConfigs?: ArmSaveConfigs) {
    destConfigs = destConfigs || this;
    switch (configType) {
      case 'ApplicationSettings':
        destConfigs.appSettingsArm = sourceConfigs.appSettingsArm;
        break;
      case 'ConnectionStrings':
        destConfigs.connectionStringsArm = sourceConfigs.connectionStringsArm;
        break;
      case 'Site':
        destConfigs.siteArm = sourceConfigs.siteArm;
        break;
      case 'SiteConfig':
        destConfigs.siteConfigArm = sourceConfigs.siteConfigArm;
        break;
      case 'SlotConfigNames':
        destConfigs.slotConfigNamesArm = sourceConfigs.slotConfigNamesArm;
        break;
      default:
        break;
    }
  }

  private _assignConfigFromResults(configType: ConfigType, results: ArmSaveResults, destConfigs?: ArmSaveConfigs) {
    const configs: ArmSaveConfigs = {
      appSettingsArm: results.appSettings ? results.appSettings.value : null,
      connectionStringsArm: results.connectionStrings ? results.connectionStrings.value : null,
      siteArm: results.site ? results.site.value : null,
      siteConfigArm: results.siteConfig ? results.siteConfig.value : null,
      slotConfigNamesArm: results.slotConfigNames ? results.slotConfigNames.value : null,
    };
    this._assignConfig(configType, configs, destConfigs);
  }

  private _appendSaveConfig(configType: ConfigType, saveConfigs: ArmSaveConfigs, updatedConfigs: ArmSaveConfigs) {
    if (this._checkConfigExistence(configType, updatedConfigs)) {
      this._assignConfig(configType, updatedConfigs, saveConfigs);
      this._setSubmittedState(configType, true);
    }
  }

  getSaveConfigs(saveConfigs: ArmSaveConfigs) {
    this._saveFailed = false;
    this._resetSubmittedStates();

    if (!this._isPristine) {
      const updatedConfigs = this._getConfigsFromForms(saveConfigs);
      this._configTypes.forEach(t => this._appendSaveConfig(t, saveConfigs, updatedConfigs));
    }
  }

  private _checkResultSuccess(configType: ConfigType, results: ArmSaveResults): boolean {
    let result: ArmSaveResult<any>;
    switch (configType) {
      case 'ApplicationSettings':
        result = results.appSettings;
        break;
      case 'ConnectionStrings':
        result = results.connectionStrings;
        break;
      case 'Site':
        result = results.site;
        break;
      case 'SiteConfig':
        result = results.siteConfig;
        break;
      case 'SlotConfigNames':
        result = results.slotConfigNames;
        break;
      default:
        break;
    }
    return !!result && result.success && !!result.value;
  }

  private _processSaveResult(configType: ConfigType, results: ArmSaveResults) {
    const isNeeded: boolean = this._checkIfNeeded(configType);
    const wasSubmitted: boolean = this._checkIfSubmitted(configType);
    this._setSubmittedState(configType, false);

    if (isNeeded || wasSubmitted) {
      if (this._checkResultSuccess(configType, results)) {
        this._assignConfigFromResults(configType, results);
      } else if (wasSubmitted) {
        this._saveFailed = true;
        //TODO: [andimarc] throw exception?
      }
    }
  }

  processSaveResults(results: ArmSaveResults) {
    if (results) {
      this._configTypes.forEach(t => this._processSaveResult(t, results));
    } else {
      //TODO: [andimarc] throw exception?
    }
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.clearBusy();
  }
}
