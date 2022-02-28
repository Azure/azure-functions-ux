import SiteService from '../../../ApiHelpers/SiteService';
import {
  AppSettingsFormValues,
  FormAppSetting,
  FormConnectionString,
  FormAzureStorageMounts,
  KeyVaultReferenceSummary,
  KeyVaultReferenceStatus,
  ConfigKeyVaultReferenceList,
} from './AppSettings.types';
import { sortBy, isEqual } from 'lodash-es';
import { ArmObj } from '../../../models/arm-obj';
import { Site, PublishingCredentialPolicies } from '../../../models/site/site';
import { SiteConfig, ArmAzureStorageMount, ConnStringInfo, VirtualApplication, KeyVaultReference } from '../../../models/site/config';
import { SlotConfigNames } from '../../../models/site/slot-config-names';
import { NameValuePair } from '../../../models/name-value-pair';
import StringUtils from '../../../utils/string';
import { CommonConstants } from '../../../utils/CommonConstants';
import { KeyValue } from '../../../models/portal-models';
import { isFunctionApp, isWindowsCode } from '../../../utils/arm-utils';
import { IconConstants } from '../../../utils/constants/IconConstants';
import { ThemeExtended } from '../../../theme/SemanticColorsExtended';

export const findFormAppSettingIndex = (appSettings: FormAppSetting[], settingName: string) => {
  return !!settingName ? appSettings.findIndex(x => x.name.toLowerCase() === settingName.toLowerCase()) : -1;
};

export const findFormAppSettingValue = (appSettings: FormAppSetting[], settingName: string) => {
  const index = findFormAppSettingIndex(appSettings, settingName);
  return index >= 0 ? appSettings[index].value : null;
};

export const removeFromAppSetting = (appSettings: FormAppSetting[], settingName: string) => {
  const appSettingsUpdated = [...appSettings];
  const index = findFormAppSettingIndex(appSettingsUpdated, settingName);
  if (index !== -1) {
    appSettingsUpdated.splice(index, 1);
  }
  return appSettingsUpdated;
};

export const addOrUpdateFormAppSetting = (appSettings: FormAppSetting[], settingName: string, value: string) => {
  const appSettingsUpdated = [...appSettings];
  const index = findFormAppSettingIndex(appSettingsUpdated, settingName);
  if (index === -1) {
    appSettingsUpdated.push({ value, name: settingName, sticky: false });
  } else {
    appSettingsUpdated[index] = { ...appSettingsUpdated[index], value };
  }
  return appSettingsUpdated;
};

interface StateToFormParams {
  site: ArmObj<Site>;
  config: ArmObj<SiteConfig>;
  appSettings: ArmObj<KeyValue<string>> | null;
  connectionStrings: ArmObj<{ [key: string]: { type: string; value: string } }> | null;
  azureStorageMounts: ArmObj<ArmAzureStorageMount> | null;
  slotConfigNames: ArmObj<SlotConfigNames> | null;
  metadata: ArmObj<KeyValue<string>> | null;
  basicPublishingCredentialsPolicies: ArmObj<PublishingCredentialPolicies> | null;
  appPermissions?: boolean;
}
export const convertStateToForm = (props: StateToFormParams): AppSettingsFormValues => {
  const {
    site,
    config,
    appSettings,
    connectionStrings,
    azureStorageMounts,
    slotConfigNames,
    metadata,
    basicPublishingCredentialsPolicies,
    appPermissions,
  } = props;
  const formAppSetting = getFormAppSetting(appSettings, slotConfigNames);

  return {
    site,
    basicPublishingCredentialsPolicies,
    config: getCleanedConfig(config),
    appSettings: formAppSetting,
    connectionStrings: getFormConnectionStrings(connectionStrings, slotConfigNames),
    virtualApplications: config && config.properties && flattenVirtualApplicationsList(config.properties.virtualApplications),
    currentlySelectedStack: getCurrentStackString(config, metadata, appSettings, isFunctionApp(site), isWindowsCode(site), appPermissions),
    azureStorageMounts: getFormAzureStorageMount(azureStorageMounts),
  };
};

export const getCleanedConfig = (config: ArmObj<SiteConfig>) => {
  // If Remote Debugging Version is set to VS2015, but Remote Debugging is disabled, just change it to VS2017 to prevent the PUT from failing
  const hasRemoteDebuggingDisabledWithVS2015 =
    !config.properties.remoteDebuggingEnabled && config.properties.remoteDebuggingVersion === 'VS2015';
  const remoteDebuggingVersion = hasRemoteDebuggingDisabledWithVS2015 ? 'VS2017' : config.properties.remoteDebuggingVersion;

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
      remoteDebuggingVersion,
    },
  };
  return newConfig;
};

export const getCleanedConfigForSave = (config: SiteConfig) => {
  let linuxFxVersion = config.linuxFxVersion || '';
  if (linuxFxVersion) {
    const linuxFxVersionParts = linuxFxVersion.split('|');
    linuxFxVersionParts[0] = linuxFxVersionParts[0].toUpperCase();
    linuxFxVersion = linuxFxVersionParts.join('|');
  }

  // If Remote Debugging Version is set to VS2015, but Remote Debugging is disabled, just change it to VS2017 to prevent the PUT from failing
  const hasRemoteDebuggingDisabledWithVS2015 = !config.remoteDebuggingEnabled && config.remoteDebuggingVersion === 'VS2015';
  const remoteDebuggingVersion = hasRemoteDebuggingDisabledWithVS2015 ? 'VS2017' : config.remoteDebuggingVersion;

  const newConfig: SiteConfig = {
    ...config,
    linuxFxVersion,
    remoteDebuggingVersion,
  };
  return newConfig;
};

export interface ApiSetupReturn {
  site: ArmObj<Site>;
  slotConfigNames: ArmObj<SlotConfigNames>;
  slotConfigNamesModified: boolean;
}
export const convertFormToState = (
  values: AppSettingsFormValues,
  currentMetadata: ArmObj<KeyValue<string>>,
  initialValues: AppSettingsFormValues,
  oldSlotConfigNames: ArmObj<SlotConfigNames>
): ApiSetupReturn => {
  const site = { ...values.site };
  const slotConfigNames = getStickySettings(values.appSettings, values.connectionStrings, oldSlotConfigNames);
  const slotConfigNamesModified = isSlotConfigNamesModified(oldSlotConfigNames, slotConfigNames);

  let config = { ...values.config.properties };
  config.virtualApplications = unFlattenVirtualApplicationsList(values.virtualApplications);
  config.azureStorageAccounts = getAzureStorageMountFromForm(values.azureStorageMounts);
  config.appSettings = getAppSettingsFromForm(values.appSettings);
  config.connectionStrings = getConnectionStringsFromForm(values.connectionStrings);
  config.metadata = getMetadataToSet(currentMetadata, values.currentlySelectedStack);
  config = getConfigWithStackSettings(config, values);
  config = getCleanedConfigForSave(config);

  site.properties.siteConfig = config;

  if (site) {
    const [id, location] = [site.id, site.location];
    if (id) {
      slotConfigNames.id = `${SiteService.getProductionId(id)}/config/slotconfignames`;
    }
    if (location) {
      slotConfigNames.location = location;
    }
  }

  return {
    site,
    slotConfigNames,
    slotConfigNamesModified,
  };
};

export const isSlotConfigNamesModified = (oldSlotConfigNames: ArmObj<SlotConfigNames>, slotConfigNames: ArmObj<SlotConfigNames>) => {
  const [oldProperties, properties] = [oldSlotConfigNames.properties, slotConfigNames.properties];
  return (
    !StringUtils.isEqualStringArray(oldProperties.appSettingNames, properties.appSettingNames) ||
    !StringUtils.isEqualStringArray(oldProperties.connectionStringNames, properties.connectionStringNames) ||
    !StringUtils.isEqualStringArray(oldProperties.azureStorageConfigNames, properties.azureStorageConfigNames)
  );
};

export const isStorageMountsModified = (initialValues: AppSettingsFormValues | null, values: AppSettingsFormValues | null) => {
  const [azureStorageMountsInitial, azureStorageMounts] = [
    (initialValues && initialValues.azureStorageMounts) || [],
    (values && values.azureStorageMounts) || [],
  ];
  const azureStorageMountsInitialSorted = azureStorageMountsInitial.sort((a, b) => (a.name > b.name ? 1 : -1));
  const azureStorageMountsSorted = azureStorageMounts.sort((a, b) => (a.name > b.name ? 1 : -1));
  return !isEqual(azureStorageMountsInitialSorted, azureStorageMountsSorted);
};

export function getStickySettings(
  appSettings: FormAppSetting[],
  connectionStrings: FormConnectionString[],
  oldSlotConfigNames: ArmObj<SlotConfigNames>
): ArmObj<SlotConfigNames> {
  let appSettingNames = appSettings.filter(x => x.sticky).map(x => x.name);
  const oldAppSettingNamesToKeep = oldSlotConfigNames.properties.appSettingNames
    ? oldSlotConfigNames.properties.appSettingNames.filter(x => appSettings.filter(y => y.name === x).length === 0)
    : [];
  appSettingNames = appSettingNames.concat(oldAppSettingNamesToKeep);

  let connectionStringNames = connectionStrings.filter(x => x.sticky).map(x => x.name);
  const oldConnectionStringNamesToKeep = oldSlotConfigNames.properties.connectionStringNames
    ? oldSlotConfigNames.properties.connectionStringNames.filter(x => connectionStrings.filter(y => y.name === x).length === 0)
    : [];
  connectionStringNames = connectionStringNames.concat(oldConnectionStringNamesToKeep);

  return {
    id: '',
    location: '',
    name: 'slotconfignames',
    properties: {
      appSettingNames,
      connectionStringNames,
      azureStorageConfigNames: oldSlotConfigNames.properties.azureStorageConfigNames,
    },
  };
}
export function getFormAppSetting(settingsData: ArmObj<KeyValue<string>> | null, slotConfigNames?: ArmObj<SlotConfigNames> | null) {
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

export function getAzureStorageMountFromForm(storageData: FormAzureStorageMounts[]): ArmAzureStorageMount {
  const storageMountFromForm: ArmAzureStorageMount = {};
  storageData.forEach(store => {
    const { name, ...rest } = store;
    storageMountFromForm[name] = rest;
  });
  return storageMountFromForm;
}

export function getAppSettingsFromForm(appSettings: FormAppSetting[]): NameValuePair[] {
  return appSettings.map(({ name, value }) => ({ name, value }));
}

export function getMetadataToSet(currentMetadata: ArmObj<KeyValue<string>>, currentStack: string) {
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
      const vaVirtualPath = v.virtualPath.endsWith('/') ? v.virtualPath : `${v.virtualPath}/`;
      return virtualPath.startsWith(vaVirtualPath);
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

export function getCurrentStackString(
  config: ArmObj<SiteConfig>,
  metadata?: ArmObj<KeyValue<string>> | null,
  appSettings?: ArmObj<KeyValue<string>> | null,
  isFunctionApp?: boolean,
  isWindowsCodeApp?: boolean,
  appPermissions?: boolean
): string {
  if (
    !!isFunctionApp &&
    appSettings &&
    appSettings.properties &&
    appSettings.properties[CommonConstants.AppSettingNames.functionsWorkerRuntime]
  ) {
    return appSettings.properties[CommonConstants.AppSettingNames.functionsWorkerRuntime].toLocaleLowerCase();
  }
  if (!!config.properties.javaVersion) {
    return 'java';
  }
  if (metadata && metadata.properties && metadata.properties.CURRENT_STACK) {
    return metadata.properties.CURRENT_STACK;
  } else if (isWindowsCodeApp || !appPermissions) {
    // Return empty value if the windows code app does not have meta data or has no access to metadata api
    return '';
  }
  return 'dotnet';
}

export function getConfigWithStackSettings(config: SiteConfig, values: AppSettingsFormValues): SiteConfig {
  const configCopy = { ...config };
  if (values.currentlySelectedStack !== 'java') {
    configCopy.javaContainer = '';
    configCopy.javaContainerVersion = '';
    configCopy.javaVersion = '';
  }

  // NOTE (krmitta): We need to explicitly mark node and php versions as null,
  // whenever these are empty since it prevents the backend from disabling the alwaysOn property.
  if (configCopy.phpVersion === '') {
    configCopy.phpVersion = null;
  }

  if (configCopy.nodeVersion === '') {
    configCopy.nodeVersion = null;
  }
  return configCopy;
}

export function getCleanedReferences(references: ArmObj<ConfigKeyVaultReferenceList>) {
  const keyToReferenceStatuses = !!references && !!references.properties && references.properties.keyToReferenceStatuses;
  if (!keyToReferenceStatuses) {
    return [];
  }

  return Object.keys(keyToReferenceStatuses).map((key, i) => ({
    name: key,
    reference: keyToReferenceStatuses[key].reference,
    status: keyToReferenceStatuses[key].status,
    details: keyToReferenceStatuses[key].details,
  }));
}

export function getKeyVaultReferenceStatus(reference: KeyVaultReferenceSummary | KeyVaultReference) {
  return !!reference.status ? reference.status.toLowerCase() : '';
}

export function isKeyVaultReferenceResolved(reference: KeyVaultReferenceSummary | KeyVaultReference) {
  return getKeyVaultReferenceStatus(reference) === KeyVaultReferenceStatus.resolved;
}

export function isKeyVaultReferenceUnResolved(reference: KeyVaultReferenceSummary | KeyVaultReference) {
  const status = getKeyVaultReferenceStatus(reference);
  return status !== KeyVaultReferenceStatus.resolved && status !== KeyVaultReferenceStatus.initialized;
}

export function getKeyVaultReferenceStatusIconProps(
  reference: KeyVaultReferenceSummary | KeyVaultReference
): { icon: string; type: string } {
  const status = getKeyVaultReferenceStatus(reference);
  if (status === KeyVaultReferenceStatus.resolved) {
    return {
      icon: IconConstants.IconNames.TickBadge,
      type: 'success',
    };
  }
  if (status === KeyVaultReferenceStatus.initialized) {
    return {
      icon: IconConstants.IconNames.InfoBadge,
      type: 'info',
    };
  }
  return {
    icon: IconConstants.IconNames.ErrorBadge,
    type: 'error',
  };
}

export function getKeyVaultReferenceStatusIconColor(reference: KeyVaultReferenceSummary | KeyVaultReference, theme: ThemeExtended) {
  const status = getKeyVaultReferenceStatus(reference);
  if (status === KeyVaultReferenceStatus.resolved) {
    return theme.semanticColors.inlineSuccessText;
  }
  if (status === KeyVaultReferenceStatus.initialized) {
    return theme.semanticColors.primaryButtonBackground;
  }
  return theme.semanticColors.inlineErrorText;
}
