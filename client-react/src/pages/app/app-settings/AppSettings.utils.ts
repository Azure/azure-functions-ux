import { ServiceLinkerWebAppConfiguration } from '../../../models/service-linker';
import { CommonConstants } from '../../../utils/CommonConstants';
import Url from '../../../utils/url';

import { AppSettingsFormValues, FormAppSetting, FormConnectionString } from './AppSettings.types';

export const isServiceLinkerVisible = () => {
  return Url.getFeatureValue(CommonConstants.FeatureFlags.showServiceLinkerConnector);
};

export const isSettingServiceLinker = (settingName: string) => {
  return !!settingName && settingName.toLowerCase().startsWith(CommonConstants.AppSettingNames.serviceLinkerPrefix);
};

export const updateWebAppConfigForServiceLinker = (
  webAppConfig: ServiceLinkerWebAppConfiguration,
  initialValues: AppSettingsFormValues,
  setInitialValues: (values: AppSettingsFormValues | null) => void,
  setCurrentValues: (values: AppSettingsFormValues) => void,
  currentValues: AppSettingsFormValues,
  deleteOperationInvoked?: boolean
) => {
  // NOTE(krmitta): ServiceLinker blade returns all the associated settings.
  // Instead of comparing and adding only those which are new/updated, we first filter-out all the matching ServiceLinker settings,
  // And, then add the settings returned by ServiceLinker's blade.

  const serviceLinkerAppSettings: FormAppSetting[] = webAppConfig.appSettings || [];
  const serviceLinkerConnectionStrings: FormConnectionString[] = webAppConfig.connectionStrings || [];
  let filteredAppSettings = initialValues.appSettings.filter(appSetting => !settingExists(appSetting.name, serviceLinkerAppSettings));
  let filteredConnectionStrings = initialValues.connectionStrings.filter(
    connStr => !settingExists(connStr.name, serviceLinkerConnectionStrings)
  );

  // NOTE(krmitta): In case of delete, the settings returned are the ones deleted,
  // so we should not them back once the initialValues are filtered.

  setInitialValues({
    ...initialValues,
    appSettings: [...filteredAppSettings, ...(deleteOperationInvoked ? [] : serviceLinkerAppSettings)],
    connectionStrings: [...filteredConnectionStrings, ...(deleteOperationInvoked ? [] : serviceLinkerConnectionStrings)],
  });

  filteredAppSettings = currentValues.appSettings.filter(appSetting => !settingExists(appSetting.name, serviceLinkerAppSettings));
  filteredConnectionStrings = currentValues.connectionStrings.filter(
    connStr => !settingExists(connStr.name, serviceLinkerConnectionStrings)
  );
  setCurrentValues({
    ...currentValues,
    appSettings: [...filteredAppSettings, ...(deleteOperationInvoked ? [] : serviceLinkerAppSettings)],
    connectionStrings: [...filteredConnectionStrings, ...(deleteOperationInvoked ? [] : serviceLinkerConnectionStrings)],
  });
};

export const settingExists = (settingName: string, allSettings: FormAppSetting[] | FormConnectionString[]) => {
  return allSettings.findIndex(setting => setting.name.toLowerCase() === settingName.toLowerCase()) > -1;
};
