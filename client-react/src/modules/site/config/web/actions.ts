import { createStandardAction } from 'typesafe-actions';

import { ArmObj, SiteConfig } from '../../../../models/WebAppModels';
import {
  WEB_CONFIG_FETCH_FAILURE,
  WEB_CONFIG_FETCH_REQUEST,
  WEB_CONFIG_FETCH_SUCCESS,
  WEB_CONFIG_UPDATE_FAILURE,
  WEB_CONFIG_UPDATE_REQUEST,
  WEB_CONFIG_UPDATE_SUCCESS,
} from './actionTypes';

export const fetchWebConfigRequest = createStandardAction(WEB_CONFIG_FETCH_REQUEST)();
export const fetchWebConfigSuccess = createStandardAction(WEB_CONFIG_FETCH_SUCCESS).map((webConfig: ArmObj<SiteConfig>) => ({
  webConfig,
}));
export const fetchWebConfigFailure = createStandardAction(WEB_CONFIG_FETCH_FAILURE).map((error: Error) => ({
  error,
}));

export const updateWebConfigRequest = createStandardAction(WEB_CONFIG_UPDATE_REQUEST).map((webConfig: ArmObj<SiteConfig>) => ({
  webConfig,
}));
export const updateWebConfigSuccess = createStandardAction(WEB_CONFIG_UPDATE_SUCCESS).map((webConfig: ArmObj<SiteConfig>) => ({
  webConfig,
}));
export const updateWebConfigFailure = createStandardAction(WEB_CONFIG_UPDATE_FAILURE).map((error: Error) => ({
  error,
}));
