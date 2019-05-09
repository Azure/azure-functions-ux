import {
  ArmObj,
  SiteConfig,
  SlotConfigNames,
  VirtualApplication,
  Site,
  NameValuePair,
  ConnStringInfo,
  ArmAzureStorageMount,
} from '../../../models/WebAppModels';

import { AppSettingsFormValues, FormAppSetting, FormConnectionString, FormAzureStorageMounts } from './AppSettings.types';
import { sortBy } from 'lodash-es';

interface StateToFormParams {
  site: ArmObj<Site>;
  config: ArmObj<SiteConfig>;
  appSettings: ArmObj<{ [key: string]: string }> | null;
  connectionStrings: ArmObj<{ [key: string]: { type: string; value: string } }> | null;
  azureStorageMounts: ArmObj<ArmAzureStorageMount> | null;
  slotConfigNames: ArmObj<SlotConfigNames>;
  metadata: ArmObj<{ [key: string]: string }> | null;
}
export const convertStateToForm = (props: StateToFormParams): AppSettingsFormValues => {
  const { site, config, appSettings, connectionStrings, azureStorageMounts, slotConfigNames, metadata } = props;
  return {
    site,
    config: getCleanedConfig(config),
    appSettings: getFormAppSetting(appSettings, slotConfigNames),
    connectionStrings: getFormConnectionStrings(connectionStrings, slotConfigNames),
    virtualApplications: config && config.properties && flattenVirtualApplicationsList(config.properties.virtualApplications),
    currentlySelectedStack: getCurrentStackString(config, metadata),
    azureStorageMounts: getFormAzureStorageMount(azureStorageMounts),
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
    name: '',
    location: '',
    properties: {
      appSettingNames,
      connectionStringNames,
      azureStorageConfigNames: oldSlotNameSettings.properties.azureStorageConfigNames,
    },
  };
}
export function getFormAppSetting(settingsData: ArmObj<{ [key: string]: string }> | null, slotConfigNames?: ArmObj<SlotConfigNames>) {
  if (!settingsData || !slotConfigNames) {
    return [];
  }
  const { appSettingNames } = slotConfigNames.properties;
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
    name: '',
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
  if (!settingsData || !slotConfigNames) {
    return [];
  }
  const { connectionStringNames } = slotConfigNames.properties;
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
  const virtualApplications = virtualApps.filter(x => !x.virtualDirectory)!;
  const virtualDirectories = virtualApps.filter(x => x.virtualDirectory);

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
