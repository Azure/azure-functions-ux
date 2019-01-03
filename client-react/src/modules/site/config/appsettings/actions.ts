import { createStandardAction } from 'typesafe-actions';

import { ArmObj } from '../../../../models/WebAppModels';
import {
  APP_SETTINGS_FETCH_FAILURE,
  APP_SETTINGS_FETCH_REQUEST,
  APP_SETTINGS_FETCH_SUCCESS,
  APP_SETTINGS_UPDATE_FAILURE,
  APP_SETTINGS_UPDATE_REQUEST,
  APP_SETTINGS_UPDATE_SUCCESS,
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
