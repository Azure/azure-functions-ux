import SiteService from '../../../ApiHelpers/SiteService';
import {
  AppSettingsFormValues,
  FormAppSetting,
  FormConnectionString,
  FormAzureStorageMounts,
  ReferenceSummary,
  ReferenceStatus,
  AppSettingReference,
  StorageAccess,
  ConfigurationOption,
  AccessKeyPlaceHolderForNFSFileShares,
  StorageFileShareProtocol,
} from './AppSettings.types';
import { sortBy, isEqual } from 'lodash-es';
import { ArmArray, ArmObj } from '../../../models/arm-obj';
import { Site, PublishingCredentialPolicies, MinTlsVersion } from '../../../models/site/site';
import {
  SiteConfig,
  ArmAzureStorageMount,
  ConnStringInfo,
  VirtualApplication,
  Reference,
  ErrorPage,
  StorageType,
} from '../../../models/site/config';
import { SlotConfigNames } from '../../../models/site/slot-config-names';
import { NameValuePair } from '../../../models/name-value-pair';
import StringUtils from '../../../utils/string';
import { CommonConstants } from '../../../utils/CommonConstants';
import { KeyValue } from '../../../models/portal-models';
import { isFlexConsumption, isFunctionApp, isWindowsCode } from '../../../utils/arm-utils';
import { IconConstants } from '../../../utils/constants/IconConstants';
import { ThemeExtended } from '../../../theme/SemanticColorsExtended';
import i18next from 'i18next';
import { isJBossClusteringShown } from '../../../utils/stacks-utils';
import { getBasicPublishingCredentialsSCMPolicies, getBasicPublishingCredentialsFTPPolicies } from '../../../utils/CredentialUtilities';

export const findFormAppSettingIndex = (appSettings: FormAppSetting[], settingName: string) => {
  return settingName ? appSettings.findIndex(x => x.name.toLowerCase() === settingName.toLowerCase()) : -1;
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
  basicPublishingCredentialsPolicies: ArmObj<PublishingCredentialPolicies>[] | null;
  errorPages: ArmArray<ErrorPage> | null;
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
    errorPages,
  } = props;
  const formAppSetting = getFormAppSetting(appSettings, slotConfigNames);

  return {
    site,
    basicPublishingCredentialsPolicies: getFormBasicPublishingCredentialsPolicies(basicPublishingCredentialsPolicies),
    config: getCleanedConfig(config),
    appSettings: formAppSetting,
    connectionStrings: getFormConnectionStrings(connectionStrings, slotConfigNames),
    virtualApplications: config && config.properties && flattenVirtualApplicationsList(config.properties.virtualApplications),
    currentlySelectedStack: getCurrentStackString(
      config,
      site,
      metadata,
      appSettings,
      isFunctionApp(site),
      isWindowsCode(site),
      appPermissions
    ),
    azureStorageMounts: getFormAzureStorageMount(azureStorageMounts, slotConfigNames),
    errorPages: getFormErrorPages(errorPages),
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

  const minTlsVersion = config.properties.minTlsVersion || MinTlsVersion.tLS12;
  const clusteringEnabled = !!config.properties.clusteringEnabled;

  const newConfig: ArmObj<SiteConfig> = {
    ...config,
    properties: {
      ...config.properties,
      linuxFxVersion,
      remoteDebuggingVersion,
      minTlsVersion,
      clusteringEnabled,
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
  const slotConfigNames = getStickySettings(values.appSettings, values.connectionStrings, values.azureStorageMounts, oldSlotConfigNames);
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

export const isStorageAccessAppSetting = (configurationOption: ConfigurationOption, type: StorageType, storageAccess: StorageAccess) => {
  return (
    configurationOption === ConfigurationOption.Advanced &&
    type === StorageType.azureFiles &&
    storageAccess === StorageAccess.KeyVaultReference
  );
};

export const getStorageMountAccessKey = (value: FormAzureStorageMounts) => {
  const { configurationOption, type, storageAccess, appSettings, accessKey } = value;
  return isStorageAccessAppSetting(configurationOption, type, storageAccess)
    ? `${AppSettingReference.prefix}${appSettings}${AppSettingReference.suffix}`
    : accessKey;
};

export function getStickySettings(
  appSettings: FormAppSetting[],
  connectionStrings: FormConnectionString[],
  azureStorageMounts: FormAzureStorageMounts[],
  oldSlotConfigNames: ArmObj<SlotConfigNames>
): ArmObj<SlotConfigNames> {
  let appSettingNames = appSettings.filter(x => x.sticky).map(x => x.name);
  const oldAppSettingNamesToKeep = oldSlotConfigNames.properties.appSettingNames
    ? oldSlotConfigNames.properties.appSettingNames.filter(x => appSettings.filter(y => y.name === x).length === 0)
    : [];
  appSettingNames = appSettingNames.concat(oldAppSettingNamesToKeep);

  const oldAzureStorageMountNames = oldSlotConfigNames.properties.azureStorageConfigNames || [];
  const azureStorageConfigNames = azureStorageMounts.filter(x => x.sticky).map(x => x.name);
  const oldAzureStorageMountNamesToKeep = oldAzureStorageMountNames.filter(x => {
    return !azureStorageMounts.find(y => y.name === x);
  });
  azureStorageConfigNames.push(...oldAzureStorageMountNamesToKeep);

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
      azureStorageConfigNames,
    },
  };
}
export function getFormAppSetting(settingsData: ArmObj<KeyValue<string>> | null, slotConfigNames?: ArmObj<SlotConfigNames> | null) {
  if (!settingsData) {
    return [];
  }
  const appSettingNames = slotConfigNames?.properties.appSettingNames ?? null;
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

export function getFormErrorPages(errorPage: ArmArray<ErrorPage> | null) {
  if (!errorPage) {
    return [];
  }

  return sortBy(
    errorPage.value.map(value => ({
      status: 'Configured',
      key: Number(value.properties.statusCode),
      errorCode: String(value.properties.statusCode),
    }))
  );
}

export function getFormAzureStorageMount(
  storageData: ArmObj<ArmAzureStorageMount> | null,
  slotConfigNames?: ArmObj<SlotConfigNames> | null
) {
  if (!storageData) {
    return [];
  }
  const appSettingNames = slotConfigNames?.properties.azureStorageConfigNames || [];

  return sortBy(
    Object.keys(storageData.properties).map(key => {
      const { accessKey, protocol, ...rest } = storageData.properties[key];

      const storageAccess =
        accessKey.startsWith(AppSettingReference.prefix) && accessKey.endsWith(AppSettingReference.suffix)
          ? StorageAccess.KeyVaultReference
          : StorageAccess.AccessKey;

      const appSettings =
        storageAccess === StorageAccess.KeyVaultReference
          ? accessKey.substring(AppSettingReference.prefix.length, accessKey.length - 1)
          : undefined;

      const configurationOption =
        storageAccess === StorageAccess.KeyVaultReference ? ConfigurationOption.Advanced : ConfigurationOption.Basic;

      const protocolValue = !protocol || protocol === StorageFileShareProtocol.HTTP ? StorageFileShareProtocol.SMB : protocol;

      const accessKeyValue =
        storageAccess === StorageAccess.KeyVaultReference ||
        protocolValue.toLocaleLowerCase() === StorageFileShareProtocol.NFS.toLocaleLowerCase()
          ? undefined
          : accessKey;

      return {
        name: key,
        sticky: appSettingNames.indexOf(key) > -1,
        storageAccess,
        appSettings,
        configurationOption,
        protocol: protocolValue,
        accessKey: accessKeyValue,
        ...rest,
      } as FormAzureStorageMounts;
    }),
    o => o.name.toLowerCase()
  );
}

export function getAzureStorageMountFromForm(storageData: FormAzureStorageMounts[]): ArmAzureStorageMount {
  const storageMountFromForm: ArmAzureStorageMount = {};
  storageData.forEach(store => {
    const { name, sticky, configurationOption, storageAccess, appSettings, accessKey, protocol, ...rest } = store;
    storageMountFromForm[name] = {
      accessKey:
        protocol.toLocaleLowerCase() === StorageFileShareProtocol.NFS.toLocaleLowerCase()
          ? AccessKeyPlaceHolderForNFSFileShares
          : getStorageMountAccessKey(store),
      protocol: rest.type === StorageType.azureBlob ? StorageFileShareProtocol.HTTP : protocol,
      ...rest,
    };
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

export function getFormBasicPublishingCredentialsPolicies(policies: ArmObj<PublishingCredentialPolicies>[] | null) {
  return {
    ftp: getBasicPublishingCredentialsFTPPolicies(policies),
    scm: getBasicPublishingCredentialsSCMPolicies(policies),
  };
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
  site: ArmObj<Site>,
  metadata?: ArmObj<KeyValue<string>> | null,
  appSettings?: ArmObj<KeyValue<string>> | null,
  isFunctionApp?: boolean,
  isWindowsCodeApp?: boolean,
  appPermissions?: boolean
): string {
  if (!!isFunctionApp && isFlexConsumption(site)) {
    return site.properties.functionAppConfig?.runtime?.name || '';
  }
  if (
    !!isFunctionApp &&
    appSettings &&
    appSettings.properties &&
    appSettings.properties[CommonConstants.AppSettingNames.functionsWorkerRuntime]
  ) {
    return appSettings.properties[CommonConstants.AppSettingNames.functionsWorkerRuntime].toLocaleLowerCase();
  }
  if (config.properties.javaVersion) {
    return 'java';
  }
  if (metadata?.properties?.CURRENT_STACK) {
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

  configCopy.clusteringEnabled = isJBossClusteringShown(config.linuxFxVersion, values.site) && configCopy.clusteringEnabled;

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

export function getCleanedReferences(references: ArmObj<Reference>[]) {
  return references.map(ref => ({
    name: ref.name,
    reference: ref.properties.reference,
    status: ref.properties.status,
    details: ref.properties.details,
  }));
}

export function getReferenceStatus(reference: ReferenceSummary | Reference) {
  return reference.status?.toLowerCase() ?? '';
}

export function isReferenceResolved(reference: ReferenceSummary | Reference) {
  return getReferenceStatus(reference) === ReferenceStatus.resolved;
}

export function getAzureConfigRefAriaLabel(reference: ReferenceSummary | Reference, t: i18next.TFunction) {
  const status = isReferenceResolved(reference);
  if (!status) {
    return t('azureAppConfigRefAriaLabelNotResolved');
  } else {
    return t('azureAppConfigRefAriaLabelResolved');
  }
}

export function getKeyVaultRefAriaLabel(reference: ReferenceSummary | Reference, t: i18next.TFunction) {
  const status = isReferenceResolved(reference);
  if (!status) {
    return t('azureKeyVaultRefNotResolved');
  } else {
    return t('azureKeyVaultRefResolved');
  }
}

export function isKeyVaultReferenceUnResolved(reference: ReferenceSummary | Reference) {
  const status = getReferenceStatus(reference);
  return status !== ReferenceStatus.resolved && status !== ReferenceStatus.initialized;
}

export function getReferenceStatusIconProps(reference: ReferenceSummary | Reference): { icon: string; type: string } {
  const status = getReferenceStatus(reference);
  if (status === ReferenceStatus.resolved) {
    return {
      icon: IconConstants.IconNames.TickBadge,
      type: 'success',
    };
  }
  if (status === ReferenceStatus.initialized) {
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

export function getReferenceStatusIconColor(reference: ReferenceSummary | Reference, theme: ThemeExtended) {
  const status = getReferenceStatus(reference);
  if (status === ReferenceStatus.resolved) {
    return theme.semanticColors.inlineSuccessText;
  }
  if (status === ReferenceStatus.initialized) {
    return theme.semanticColors.primaryButtonBackground;
  }
  return theme.semanticColors.inlineErrorText;
}
