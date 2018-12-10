import { updateCurrentSite, updateResourceIdAtomic, updateCurrentSiteNoCache } from './actions';
import { checkCacheValid } from 'redux-cache';
import axios from 'axios';
import { ArmObj, Site, NameValuePair } from '../../models/WebAppModels';
import { AppSetting } from './config/appsettings/appsettings.types';
import { ConnectionString } from './config/connectionstrings/connectionstrings.types';
import { updateCurrentSiteAppSettings, updateCurrentSiteAppSettingsNoCache } from './config/appsettings/actions';
import { updateCurrentSiteConnectionStrings, updateCurrentSiteConnectionStringsNoCache } from './config/connectionstrings/actions';
import IState from '../types';
import { xor, uniq } from 'lodash-es';
import { updateSlotConfigNames } from './config/slotConfigNames/thunks';
import { CommonConstants } from '../../utils/CommonConstants';

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
      const siteFetch = await axios.get<ArmObj<Site>>(
        `${armEndpoint}${currentSite.resourceId}?api-version=${CommonConstants.ApiVersions.websiteApiVersion20180201}`,
        {
          headers: {
            Authorization: `Bearer ${armToken}`,
          },
        }
      );
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
    value.properties.siteConfig.connectionStrings = getConnectionStringsForUpdate(getState, connectionStrings);
    value.properties.siteConfig.appSettings = getAppSettingsForUpdate(getState, appSettings);
    value.properties.siteConfig.metadata = getMetadataForUpdate(getState, metadata);

    try {
      const siteUpdate = await axios.put<ArmObj<Site>>(
        `${armEndpoint}${value.id}?api-version=${CommonConstants.ApiVersions.websiteApiVersion20180201}`,
        value,
        {
          headers: {
            Authorization: `Bearer ${armToken}`,
          },
        }
      );
      await updateStickySettings(dispatch, getState, connectionStrings, appSettings);
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

const getAppSettingsForUpdate = (getState: () => IState, appSettings?: AppSetting[]): any | undefined => {
  if (!appSettings) {
    return undefined;
  }

  const appSettingsClean = appSettings.map(
    x =>
      ({
        name: x.name,
        value: x.value,
      } as NameValuePair)
  );
  return appSettingsClean;
};

const getConnectionStringsForUpdate = (getState: () => IState, connectionStrings?: ConnectionString[]): any | undefined => {
  if (!connectionStrings) {
    return undefined;
  }
  const connectionStringsClean = connectionStrings.map(x => ({
    name: x.name,
    connectionString: x.value,
    type: +x.type,
  }));
  return connectionStringsClean;
};

const getMetadataForUpdate = (getState: () => IState, metadata?: ArmObj<{ [key: string]: string }>): any | undefined => {
  if (!metadata) {
    return undefined;
  }
  const md = Object.keys(metadata.properties).map(name => {
    return {
      name,
      value: metadata.properties[name],
    };
  });
  return md;
};
const updateStickySettings = async (
  dispatch: any,
  getState: () => IState,
  connectionStrings?: ConnectionString[],
  appSettings?: AppSetting[]
): Promise<void> => {
  if (!connectionStrings && !appSettings) {
    return;
  }

  const currentSlotConfigNames = getState().slotConfigNames.slotConfigNames;
  const newSlotConfigNames = { ...currentSlotConfigNames };
  if (appSettings) {
    const appSettingConfigNames = appSettings.filter(x => x.sticky).map(x => x.name);
    newSlotConfigNames.appSettingNames = uniq(newSlotConfigNames.appSettingNames.concat(appSettingConfigNames));
  }
  if (connectionStrings) {
    const connectionStringSlotNames = connectionStrings.filter(x => x.sticky).map(x => x.name);
    newSlotConfigNames.connectionStringNames = uniq(newSlotConfigNames.connectionStringNames.concat(connectionStringSlotNames));
  }

  const appSettingsDifference = xor(currentSlotConfigNames.appSettingNames.sort(), newSlotConfigNames.appSettingNames.sort());
  const connectionstringDifference = xor(
    currentSlotConfigNames.connectionStringNames.sort(),
    newSlotConfigNames.connectionStringNames.sort()
  );
  if (appSettingsDifference.length > 0 || connectionstringDifference.length > 0) {
    await dispatch(updateSlotConfigNames(newSlotConfigNames));
  }
};
