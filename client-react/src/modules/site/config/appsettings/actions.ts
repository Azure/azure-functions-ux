import { createStandardAction } from 'typesafe-actions';

import { ArmObj, Site } from '../../../../models/WebAppModels';
import {
  APP_SETTINGS_FETCH_FAILURE,
  APP_SETTINGS_FETCH_REQUEST,
  APP_SETTINGS_FETCH_SUCCESS,
  APP_SETTINGS_UPDATE_FAILURE,
  APP_SETTINGS_UPDATE_REQUEST,
  APP_SETTINGS_UPDATE_SUCCESS,
  UPDATE_APP_SETTINGS_FROM_SITE_UPDATE,
} from './actionTypes';
import { AppSettings } from './reducer';

export const fetchAppSettingsRequest = createStandardAction(APP_SETTINGS_FETCH_REQUEST)();

export const fetchAppSettingsSuccess = createStandardAction(APP_SETTINGS_FETCH_SUCCESS).map((appSettings: ArmObj<AppSettings>) => ({
  appSettings,
}));
export const fetchAppSettingsFailure = createStandardAction(APP_SETTINGS_FETCH_FAILURE).map((error: Error) => ({
  error,
}));

export const updateAppSettingsRequest = createStandardAction(APP_SETTINGS_UPDATE_REQUEST).map((appSettings: ArmObj<AppSettings>) => ({
  appSettings,
}));

export const updateAppSettingsSuccess = createStandardAction(APP_SETTINGS_UPDATE_SUCCESS).map((appSettings: ArmObj<AppSettings>) => ({
  appSettings,
}));

export const updateAppSettingsFailure = createStandardAction(APP_SETTINGS_UPDATE_FAILURE).map((error: Error) => ({
  error,
}));

export const updateAppSettingsFromSiteUpdate = createStandardAction(UPDATE_APP_SETTINGS_FROM_SITE_UPDATE).map((site: ArmObj<Site>) => {
  const appSettingsFromSite = !!site.properties && !!site.properties.siteConfig && site.properties.siteConfig.appSettings;
  if (appSettingsFromSite) {
    const updatedAppSettings: AppSettings = {};
    appSettingsFromSite.forEach(appSetting => {
      updatedAppSettings[appSetting.name] = appSetting.value;
    });
    return { appSettings: updatedAppSettings };
  }
  return { appSettings: null };
});
