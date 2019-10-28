import SiteService from '../../../ApiHelpers/SiteService';
import {
  AppSettingsFormValues,
  FormAppSetting,
  FormConnectionString,
  FormAzureStorageMounts,
  FunctionsRuntimeMajorVersions,
  FunctionsRuntimeVersionInfo,
  FunctionsRuntimeGenerations,
} from './AppSettings.types';
import { sortBy } from 'lodash-es';
import { ArmObj, ArmArray } from '../../../models/arm-obj';
import { Site } from '../../../models/site/site';
import { SiteConfig, ArmAzureStorageMount, ConnStringInfo, VirtualApplication, KeyVaultReference } from '../../../models/site/config';
import { SlotConfigNames } from '../../../models/site/slot-config-names';
import { NameValuePair } from '../../../models/name-value-pair';
import { HostStatus } from '../../../models/functions/host-status';
import { CommonConstants } from '../../../utils/CommonConstants';
import { FunctionInfo } from '../../../models/functions/function-info';

export const getFunctionsRuntimeMajorVersion = (version: string | null) => {
  switch (version) {
    case FunctionsRuntimeMajorVersions.v1:
      return FunctionsRuntimeMajorVersions.v1;
    case FunctionsRuntimeMajorVersions.v2:
      return FunctionsRuntimeMajorVersions.v2;
    case FunctionsRuntimeMajorVersions.v3:
      return FunctionsRuntimeMajorVersions.v3;
    default:
      return FunctionsRuntimeMajorVersions.custom;
  }
};

export const getFunctionsRuntimeGeneration = (version: string | null) => {
  if (!version) {
    return FunctionsRuntimeGenerations.v3;
  }
  if (version.startsWith('~1') || version.startsWith('1.')) {
    return FunctionsRuntimeGenerations.v2;
  }
  if (version.startsWith('~2') || version.startsWith('2') || version.startsWith('beta')) {
    return FunctionsRuntimeGenerations.v2;
  }
  if (version.startsWith('~3') || version.startsWith('3')) {
    return FunctionsRuntimeGenerations.v3;
  }

  return FunctionsRuntimeGenerations.v3;
};

export const getFunctionsRuntimeVersionInfo = (
  appSettings: FormAppSetting[],
  functionsRuntimeVersionInfo?: FunctionsRuntimeVersionInfo
): FunctionsRuntimeVersionInfo => {
  const appSetting = findFormAppSetting(appSettings, CommonConstants.AppSettingNames.functionsExtensionVersion);
  const appSettingValue = !appSetting ? '' : appSetting.value;

  const majorVersion = getFunctionsRuntimeMajorVersion(appSettingValue);
  // const generation = getFunctionsRuntimeGeneration(appSettingValue);

  if (majorVersion === FunctionsRuntimeMajorVersions.custom) {
    return { isCustom: true, errorMessage: '', latestCustomValue: appSettingValue };
  }

  if (
    functionsRuntimeVersionInfo &&
    functionsRuntimeVersionInfo.isCustom &&
    functionsRuntimeVersionInfo.latestCustomValue === appSettingValue
  ) {
    return { ...functionsRuntimeVersionInfo };
  }

  return {
    isCustom: false,
    errorMessage: '',
    latestCustomValue: functionsRuntimeVersionInfo ? functionsRuntimeVersionInfo.latestCustomValue : '',
  };
};

export const findFormAppSettingIndex = (appSettings: FormAppSetting[], settingName: string) => {
  return !appSettings || !settingName ? -1 : appSettings.findIndex(x => x.name.toLowerCase() === settingName.toLowerCase());
};

export const findFormAppSetting = (appSettings: FormAppSetting[], settingName: string) => {
  const index = findFormAppSettingIndex(appSettings, settingName);
  return index >= 0 ? appSettings[index] : null;
};

interface StateToFormParams {
  site: ArmObj<Site>;
  config: ArmObj<SiteConfig>;
  appSettings: ArmObj<{ [key: string]: string }> | null;
  connectionStrings: ArmObj<{ [key: string]: { type: string; value: string } }> | null;
  azureStorageMounts: ArmObj<ArmAzureStorageMount> | null;
  slotConfigNames: ArmObj<SlotConfigNames> | null;
  metadata: ArmObj<{ [key: string]: string }> | null;
  hostStatus: ArmObj<HostStatus> | null;
  functions: ArmArray<FunctionInfo> | null;
}
export const convertStateToForm = (props: StateToFormParams): AppSettingsFormValues => {
  const { site, config, appSettings, connectionStrings, azureStorageMounts, slotConfigNames, metadata, hostStatus, functions } = props;
  const formAppSetting = getFormAppSetting(appSettings, slotConfigNames);

  return {
    site,
    hostStatus,
    functions,
    config: getCleanedConfig(config),
    appSettings: formAppSetting,
    connectionStrings: getFormConnectionStrings(connectionStrings, slotConfigNames),
    virtualApplications: config && config.properties && flattenVirtualApplicationsList(config.properties.virtualApplications),
    currentlySelectedStack: getCurrentStackString(config, metadata),
    azureStorageMounts: getFormAzureStorageMount(azureStorageMounts),
    functionsRuntimeVersionInfo: getFunctionsRuntimeVersionInfo(formAppSetting),
  };
};

export const getCleanedConfig = (config: ArmObj<SiteConfig>) => {
  let linuxFxVersion = config.properties.linuxFxVersion ? config.properties.linuxFxVersion : '';
  if (linuxFxVersion) {
    const linuxFxVersionParts = linuxFxVersion.split('|');
    linuxFxVersionParts[0] = linuxFxVersionParts[0].toLowerCase();
    linuxFxVersion = linuxFxVersionParts.join('|');
  }
  const newConfig: ArmObj<SiteConfig> = {
    ...config,
    properties: {
      ...config.properties,
      linuxFxVersion,
    },
  };
  return newConfig;
};

export const getCleanedConfigForSave = (config: ArmObj<SiteConfig>) => {
  let linuxFxVersion = config.properties.linuxFxVersion ? config.properties.linuxFxVersion : '';
  if (linuxFxVersion) {
    const linuxFxVersionParts = linuxFxVersion.split('|');
    linuxFxVersionParts[0] = linuxFxVersionParts[0].toUpperCase();
    linuxFxVersion = linuxFxVersionParts.join('|');
  }
  const newConfig: ArmObj<SiteConfig> = {
    ...config,
    properties: {
      ...config.properties,
      linuxFxVersion,
    },
  };
  return newConfig;
};

export interface ApiSetupReturn {
  site: ArmObj<Site>;
  config: ArmObj<SiteConfig>;
  slotConfigNames: ArmObj<SlotConfigNames>;
  storageMounts: ArmObj<ArmAzureStorageMount>;
}
export const convertFormToState = (
  values: AppSettingsFormValues,
  currentMetadata: ArmObj<{ [key: string]: string }>,
  oldSlotNameSettings: ArmObj<SlotConfigNames>
): ApiSetupReturn => {
  const config = values.config;
  config.properties.virtualApplications = unFlattenVirtualApplicationsList(values.virtualApplications);
  config.properties.azureStorageAccounts = undefined;
  const site = values.site;

  site.properties.siteConfig = {
    appSettings: getAppSettingsFromForm(values.appSettings),
    connectionStrings: getConnectionStringsFromForm(values.connectionStrings),
    metadata: getMetadataToSet(currentMetadata, values.currentlySelectedStack),
  };

  const slotConfigNames = getStickySettings(values.appSettings, values.connectionStrings, oldSlotNameSettings);
  const configWithStack = getConfigWithStackSettings(config, values);
  const storageMounts = getAzureStorageMountFromForm(values.azureStorageMounts);

  if (site) {
    const [id, location] = [site.id, site.location];
    if (id) {
      slotConfigNames.id = `${SiteService.getProductionId(id)}/config/slotconfignames`;
      storageMounts.id = `${id}/config/azureStorageAccounts`;
    }
    if (location) {
      slotConfigNames.location = location;
      storageMounts.location = location;
    }
  }

  return {
    site,
    slotConfigNames,
    storageMounts,
    config: configWithStack,
  };
};

export function getStickySettings(
  appSettings: FormAppSetting[],
  connectionStrings: FormConnectionString[],
  oldSlotNameSettings: ArmObj<SlotConfigNames>
): ArmObj<SlotConfigNames> {
  let appSettingNames = appSettings.filter(x => x.sticky).map(x => x.name);
  const oldAppSettingNamesToKeep = oldSlotNameSettings.properties.appSettingNames
    ? oldSlotNameSettings.properties.appSettingNames.filter(x => appSettings.filter(y => y.name === x).length === 0)
    : [];
  appSettingNames = appSettingNames.concat(oldAppSettingNamesToKeep);

  let connectionStringNames = connectionStrings.filter(x => x.sticky).map(x => x.name);
  const oldConnectionStringNamesToKeep = oldSlotNameSettings.properties.connectionStringNames
    ? oldSlotNameSettings.properties.connectionStringNames.filter(x => connectionStrings.filter(y => y.name === x).length === 0)
    : [];
  connectionStringNames = connectionStringNames.concat(oldConnectionStringNamesToKeep);

  return {
    id: '',
    location: '',
    name: 'slotconfignames',
    properties: {
      appSettingNames,
      connectionStringNames,
      azureStorageConfigNames: oldSlotNameSettings.properties.azureStorageConfigNames,
    },
  };
}
export function getFormAppSetting(
  settingsData: ArmObj<{ [key: string]: string }> | null,
  slotConfigNames?: ArmObj<SlotConfigNames> | null
) {
  if (!settingsData) {
    return [];
  }
  const appSettingNames = !!slotConfigNames ? slotConfigNames.properties.appSettingNames : null;
  return sortBy(
    Object.keys(settingsData.properties).map((key, i) => ({
      name: key,
      value: settingsData.properties[key],
      sticky: !!appSettingNames && appSettingNames.indexOf(key) > -1,
      index: i,
    })),
    o => o.name.toLowerCase()
  );
}

export function getFormAzureStorageMount(storageData: ArmObj<ArmAzureStorageMount> | null) {
  if (!storageData) {
    return [];
  }
  return sortBy(
    Object.keys(storageData.properties).map(key => ({
      name: key,
      ...storageData.properties[key],
    })),
    o => o.name.toLowerCase()
  );
}

export function getAzureStorageMountFromForm(storageData: FormAzureStorageMounts[]): ArmObj<ArmAzureStorageMount> {
  const storageMountFromForm: ArmAzureStorageMount = {};
  storageData.forEach(store => {
    const { name, ...rest } = store;
    storageMountFromForm[name] = rest;
  });
  return {
    id: '',
    location: '',
    name: 'azurestorageaccounts',
    properties: storageMountFromForm,
  };
}

export function getAppSettingsFromForm(appSettings: FormAppSetting[]): NameValuePair[] {
  return appSettings.map(({ name, value }) => ({ name, value }));
}

export function getMetadataToSet(currentMetadata: ArmObj<{ [key: string]: string }>, currentStack: string) {
  const properties = {
    ...currentMetadata.properties,
    CURRENT_STACK: currentStack,
  };
  return Object.keys(properties).map(md => ({
    name: md,
    value: properties[md],
  }));
}
export function getFormConnectionStrings(
  settingsData: ArmObj<{ [key: string]: { type: string; value: string } }> | null,
  slotConfigNames: ArmObj<SlotConfigNames> | null
) {
  if (!settingsData) {
    return [];
  }
  const connectionStringNames = slotConfigNames ? slotConfigNames.properties.connectionStringNames : null;
  return sortBy(
    Object.keys(settingsData.properties).map((key, i) => ({
      name: key,
      value: settingsData.properties[key].value,
      type: settingsData.properties[key].type,
      sticky: !!connectionStringNames && connectionStringNames.indexOf(key) > -1,
      index: i,
    })),
    o => o.name.toLowerCase()
  );
}

export function getConnectionStringsFromForm(connectionStrings: FormConnectionString[]): ConnStringInfo[] {
  return connectionStrings.map(({ name, value, type }) => ({
    name,
    type,
    connectionString: value,
  }));
}

export function unFlattenVirtualApplicationsList(virtualApps: VirtualApplication[]) {
  if (!virtualApps) {
    return [];
  }

  const newList: VirtualApplication[] = [];
  virtualApps.forEach(va => {
    newList.push({ ...va, virtualDirectories: [] });
  });

  const virtualApplications = newList.filter(x => !x.virtualDirectory)!;
  const virtualDirectories = newList.filter(x => x.virtualDirectory);

  virtualApplications.sort((a, b) => b.virtualPath.length - a.virtualPath.length);
  virtualDirectories.forEach(vd => {
    const virtualPath = vd.virtualPath.startsWith('/') ? vd.virtualPath : `/${vd.virtualPath}`;

    const va = virtualApplications.find(v => {
      return virtualPath.startsWith(v.virtualPath);
    });

    if (va) {
      const regex = new RegExp(`${va.virtualPath}(.*)`);
      const match = regex.exec(virtualPath);
      vd.virtualPath = match![1];
      if (va.virtualDirectories) {
        va.virtualDirectories.push(vd);
      } else {
        va.virtualDirectories = [vd];
      }
    }
  });
  return virtualApplications;
}

export function flattenVirtualApplicationsList(virtualApps: VirtualApplication[] | null) {
  if (!virtualApps) {
    return [];
  }
  const newList: VirtualApplication[] = [];
  virtualApps.forEach(va => {
    newList.push({ ...va, virtualDirectory: false, virtualDirectories: [] });
    if (va.virtualDirectories && va.virtualDirectories.length > 0) {
      va.virtualDirectories.forEach(element => {
        const virtualPath = `${
          va.virtualPath.endsWith('/') && element.virtualPath.startsWith('/') ? va.virtualPath.slice(0, -2) : va.virtualPath
        }${element.virtualPath}`;
        newList.push({
          ...element,
          virtualPath: `${virtualPath}`,
          virtualDirectory: true,
        });
      });
    }
  });
  return newList;
}

export function getCurrentStackString(config: ArmObj<SiteConfig>, metadata?: ArmObj<{ [key: string]: string }> | null): string {
  if (!!config.properties.javaVersion) {
    return 'java';
  }
  if (metadata && metadata.properties && metadata.properties.CURRENT_STACK) {
    return metadata.properties.CURRENT_STACK;
  }
  return 'dotnet';
}

export function getConfigWithStackSettings(config: ArmObj<SiteConfig>, values: AppSettingsFormValues): ArmObj<SiteConfig> {
  const configCopy = { ...config };
  if (values.currentlySelectedStack !== 'java') {
    configCopy.properties.javaContainer = '';
    configCopy.properties.javaContainerVersion = '';
    configCopy.properties.javaVersion = '';
  }
  return configCopy;
}

export function getCleanedReferences(references: ArmObj<{ [keyToReferenceStatuses: string]: { [key: string]: KeyVaultReference } }>) {
  if (!references.properties.keyToReferenceStatuses) {
    return [];
  }
  const keyReferenceStatuses = references.properties.keyToReferenceStatuses;
  return Object.keys(keyReferenceStatuses).map((key, i) => ({
    name: key,
    reference: keyReferenceStatuses[key].reference,
    status: keyReferenceStatuses[key].status,
    details: keyReferenceStatuses[key].details,
  }));
}
