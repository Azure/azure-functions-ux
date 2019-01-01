import { ArmObj, SiteConfig, SlotConfigNames, VirtualApplication } from '../../../models/WebAppModels';
import { AppSettings } from '../../../modules/site/config/appsettings/reducer';
import { ConnectionString } from '../../../modules/site/config/connectionstrings/reducer';
import { AppSettingsFormValues } from './AppSettings.types';
import { AppSettingsDataLoaderProps } from './AppSettingsDataLoader';

export const convertStateToForm = (props: AppSettingsDataLoaderProps): AppSettingsFormValues => {
  const { site, config, appSettings, connectionStrings, metadata, siteWritePermission, slotConfigNames } = props;
  return {
    site: site.data,
    config: config.data,
    appSettings: getFormAppSetting(appSettings.data, slotConfigNames.data),
    connectionStrings: getFormConnectionStrings(connectionStrings.data, slotConfigNames.data),
    siteWritePermission,
    virtualApplications:
      config.data && config.data && config.data.properties && flattenVirtualApplicationsList(config.data.properties.virtualApplications),
    currentlySelectedStack: getCurrentStackString(config.data, metadata.data),
  };
};

export function getFormAppSetting(settingsData: ArmObj<AppSettings>, slotConfigNames: ArmObj<SlotConfigNames>) {
  const { appSettingNames } = slotConfigNames.properties;
  return Object.keys(settingsData.properties).map(key => ({
    name: key,
    value: settingsData.properties[key],
    sticky: !!appSettingNames && appSettingNames.indexOf(key) > -1,
  }));
}

export function getFormConnectionStrings(settingsData: ArmObj<ConnectionString>, slotConfigNames: ArmObj<SlotConfigNames>) {
  const { connectionStringNames } = slotConfigNames.properties;
  return Object.keys(settingsData.properties).map(key => ({
    name: key,
    value: settingsData.properties[key].value,
    type: settingsData.properties[key].type,
    sticky: !!connectionStringNames && connectionStringNames.indexOf(key) > -1,
  }));
}
export function unFlattenVirtualApplicationsList(virtualApps: VirtualApplication[]) {
  const virtualApplications = virtualApps.filter(x => !x.virtualDirectory)!;
  const virtualDirectories = virtualApps.filter(x => x.virtualDirectory);

  virtualApplications.sort((a, b) => b.virtualPath.length - a.virtualPath.length);

  virtualDirectories.forEach(virtualDirectory => {
    let appFound = false;
    const dirPathLen = virtualDirectory.virtualPath.length;
    for (let i = 0; i < virtualApplications.length && !appFound; i = i + 1) {
      const appPathLen = virtualApplications[i].virtualPath.length;
      if (appPathLen < dirPathLen && virtualDirectory.virtualPath.startsWith(virtualApplications[i].virtualPath)) {
        appFound = true;
        virtualDirectory.virtualPath = virtualDirectory.virtualPath.substring(appPathLen);
        virtualApplications[i].virtualDirectories!.push(virtualDirectory);
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
        newList.push({
          ...element,
          virtualPath: `${va.virtualPath}${element.virtualPath}`,
          virtualDirectory: true,
        });
      });
    }
  });
  return newList;
}

export function getCurrentStackString(config: ArmObj<SiteConfig>, metadata: ArmObj<{ [key: string]: string }>): string {
  if (!!config.properties.javaVersion) {
    return 'java';
  }
  if (metadata && metadata.properties && metadata.properties.CURRENT_STACK) {
    return metadata.properties.CURRENT_STACK;
  }
  return 'dotnet';
}
