import { createStandardAction } from 'typesafe-actions';

import { ArmObj, Site } from '../../models/WebAppModels';
import {
  SITE_FETCH_FAILURE,
  SITE_FETCH_REQUEST,
  SITE_FETCH_SUCCESS,
  SITE_UPDATE_FAILURE,
  SITE_UPDATE_REQUEST,
  SITE_UPDATE_SUCCESS,
  UPDATE_RESOURCE_ID,
} from './actionTypes';

export const updateResourceId = createStandardAction(UPDATE_RESOURCE_ID).map((id: string) => ({ id }));
export const fetchSiteRequest = createStandardAction(SITE_FETCH_REQUEST)();
export const fetchSiteSuccess = createStandardAction(SITE_FETCH_SUCCESS).map((site: ArmObj<Site>) => ({ site }));
export const fetchSiteFailure = createStandardAction(SITE_FETCH_FAILURE).map((error: Error) => ({
  error,
}));

export const updateSiteRequest = createStandardAction(SITE_UPDATE_REQUEST).map((site: ArmObj<Site>) => ({ site }));
export const updateSiteSuccess = createStandardAction(SITE_UPDATE_SUCCESS).map((site: ArmObj<Site>) => ({ site }));
export const updateSiteFailure = createStandardAction(SITE_UPDATE_FAILURE).map((error: Error) => ({
  error,
}));
