import { updateCurrentSite, updateResourceIdAtomic, updateCurrentSiteNoCache } from './actions';
import { checkCacheValid } from 'redux-cache';
import axios from 'axios';
import { ArmObj, Site, NameValuePair } from '../../models/WebAppModels';
import { AppSetting } from './config/appsettings/appsettings.types';
import { ConnectionString } from './config/connectionstrings/connectionstrings.types';
import { updateCurrentSiteAppSettings, updateCurrentSiteAppSettingsNoCache } from './config/appsettings/actions';
import { updateCurrentSiteConnectionStrings, updateCurrentSiteConnectionStringsNoCache } from './config/connectionstrings/actions';
import IState from '../types';

export function updateResourceId(resourceId: string) {
  return async (dispatch: any) => {
    dispatch(updateResourceIdAtomic(resourceId));
    return dispatch(fetchSite());
  };
}

export function fetchSite() {
  return async (dispatch: any, getState: () => IState) => {
    const startupInfo = getState().portalService.startupInfo;
    if (!startupInfo) {
      return null;
    }
    const armToken = startupInfo.token;
    const armEndpoint = startupInfo.armEndpoint;
    const currentSite = getState().site;
    const isCacheValid = checkCacheValid(getState, 'site');
    if (isCacheValid && currentSite.resourceId === currentSite.site.id && !currentSite.loading) {
      return currentSite.site;
    }

    dispatch(updateCurrentSiteNoCache({ loading: true }));
    try {
      const siteFetch = await axios.get<ArmObj<Site>>(`${armEndpoint}${currentSite.resourceId}?api-version=2016-03-01`, {
        headers: {
          Authorization: `Bearer ${armToken}`,
        },
      });
      const siteResult = siteFetch.data;
      dispatch(updateCurrentSite({ site: siteResult, loading: false }));
      return siteResult;
    } catch (err) {
      console.log(err);
      dispatch(updateCurrentSite({ loading: false }));
    }
    return null;
  };
}

export function updateSite(
  value: ArmObj<Site>,
  appSettings?: AppSetting[],
  connectionStrings?: ConnectionString[],
  metadata?: ArmObj<{ [key: string]: string }>
) {
  return async (dispatch: any, getState: () => IState) => {
    const startupInfo = getState().portalService.startupInfo;
    const armToken = startupInfo!.token;
    const armEndpoint = startupInfo!.armEndpoint;
    dispatch(updateCurrentSiteNoCache({ saving: true }));
    dispatch(updateCurrentSiteAppSettingsNoCache({ saving: true }));
    dispatch(updateCurrentSiteConnectionStringsNoCache({ saving: true }));
    value.properties.siteConfig = value.properties.siteConfig || {};
    if (appSettings) {
      // const stickyAppSettings = appSettings.filter(x => x.sticky).map(x => x.name);
      const appSettingsClean = appSettings.map(
        x =>
          ({
            name: x.name,
            value: x.value,
          } as NameValuePair)
      );
      value.properties.siteConfig.appSettings = appSettingsClean;
    }
    if (connectionStrings) {
      // const stickyAppSettings = appSettings.filter(x => x.sticky).map(x => x.name);
      const connectionStringsClean = connectionStrings.map(x => ({
        name: x.name,
        connectionString: x.value,
        type: +x.type,
      }));
      value.properties.siteConfig.connectionStrings = connectionStringsClean;
    }
    if (metadata) {
      const md = Object.keys(metadata.properties).map(name => {
        return {
          name,
          value: metadata.properties[name],
        };
      });
      value.properties.siteConfig.metadata = md;
    }
    try {
      const siteUpdate = await axios.put<ArmObj<Site>>(`${armEndpoint}${value.id}?api-version=2016-03-01`, value, {
        headers: {
          Authorization: `Bearer ${armToken}`,
        },
      });
      const siteResult = siteUpdate.data;
      dispatch(updateCurrentSite({ site: siteResult, saving: false }));
      if (appSettings) {
        dispatch(
          updateCurrentSiteAppSettings({
            settings: appSettings,
            saving: false,
          })
        );
      }
      if (connectionStrings) {
        dispatch(updateCurrentSiteConnectionStrings({ connectionStrings, saving: false }));
      }
    } catch (err) {
      console.log(err);
      dispatch(updateCurrentSiteConnectionStrings({ connectionStrings, saving: false }));
      dispatch(
        updateCurrentSiteAppSettings({
          saving: false,
        })
      );
    }
  };
}
