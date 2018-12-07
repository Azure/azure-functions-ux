import { updateCurrentSiteMetadataConfig, updateSiteConfigMetadataLoading, updateSiteConfigMetadataSaving } from './actions';
import { checkCacheValid } from 'redux-cache';
import axios from 'axios';
import IState from '../../../types';
import { ArmObj } from '../../../../models/WebAppModels';
import { CommonConstants } from 'src/utils/CommonConstants';

export function fetchMetadata() {
  return async (dispatch: any, getState: () => IState) => {
    const startupInfo = getState().portalService.startupInfo;
    const armToken = startupInfo!.token;
    const armEndpoint = startupInfo!.armEndpoint;
    const resourceId = `${startupInfo!.resourceId}/config/metadata`;
    const currentWebconfig = getState().metadata.metadata;
    const isCacheValid = checkCacheValid(getState, 'metadata');
    if (isCacheValid && resourceId === currentWebconfig.id) {
      dispatch(updateSiteConfigMetadataLoading(false));
      return;
    }
    dispatch(updateSiteConfigMetadataLoading(true));
    try {
      const siteFetch = await axios.post(
        `${armEndpoint}${resourceId}/list?api-version=${CommonConstants.ApiVersions.websiteApiVersion20180201}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${armToken}`,
          },
        }
      );
      const result = siteFetch.data;
      dispatch(updateCurrentSiteMetadataConfig(result));
      dispatch(updateSiteConfigMetadataLoading(false));
      return result;
    } catch {
      return null;
    }
  };
}

export function updateMetadata(metadata: ArmObj<{ [key: string]: string }>) {
  return async (dispatch: any, getState: () => IState) => {
    const startupInfo = getState().portalService.startupInfo;
    const armToken = startupInfo!.token;
    const armEndpoint = startupInfo!.armEndpoint;
    dispatch(updateSiteConfigMetadataSaving(true));
    try {
      const siteUpdate = await axios.put<ArmObj<{ [key: string]: string }>>(
        `${armEndpoint}${startupInfo!.resourceId}/config/metadata?api-version=${CommonConstants.ApiVersions.websiteApiVersion20180201}`,
        metadata,
        {
          headers: {
            Authorization: `Bearer ${armToken}`,
          },
        }
      );
      const siteResult = siteUpdate.data;
      dispatch(updateCurrentSiteMetadataConfig(siteResult));
    } catch (err) {
      console.log(err);
    } finally {
      dispatch(updateSiteConfigMetadataSaving(false));
    }
  };
}
