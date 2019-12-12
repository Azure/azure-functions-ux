import { ApplicationSettings, ApplicationSettingInfo } from 'app/shared/models/arm/application-settings';

export class AppSettingsHelper {
  public static getAppSettingInfo(settingName: string, appSettings: ApplicationSettings): ApplicationSettingInfo {
    if (!!appSettings && !!settingName) {
      const keys = Object.keys(appSettings);
      const key = keys.find(k => k.toLocaleLowerCase() === settingName.toLocaleLowerCase());
      if (key) {
        return {
          name: key,
          value: appSettings[key],
        };
      }
    }

    return null;
  }

  public static mergeAppSettings(baseAppSettings: ApplicationSettings, newAppSettings: ApplicationSettings): ApplicationSettings {
    const [baseSettings, newSettings] = [baseAppSettings || {}, newAppSettings || {}];
    const [baseSettingsNames, newSettingsNames] = [Object.keys(baseSettings), Object.keys(newSettings)];
    const [baseSettingsPopulated, newSettingsPopulated] = [baseSettingsNames.length >= 0, newSettingsNames.length >= 0];

    let mergedSettings = {};

    if (baseSettingsPopulated && newSettingsPopulated) {
      mergedSettings = { ...baseSettings };
      newSettingsNames.forEach(newSettingName => {
        const mergedSettingValue = newSettings[newSettingName];
        const mergedSettingName =
          baseSettingsNames.find(baseSettingName => baseSettingName.toLocaleLowerCase() === newSettingName.toLocaleLowerCase()) ||
          newSettingName;
        mergedSettings[mergedSettingName] = mergedSettingValue;
      });
    } else if (baseSettingsPopulated) {
      mergedSettings = { ...baseSettings };
    } else if (newSettingsPopulated) {
      mergedSettings = { ...newSettings };
    }

    return mergedSettings;
  }
}
