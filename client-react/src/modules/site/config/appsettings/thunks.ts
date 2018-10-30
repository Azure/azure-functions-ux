import { updateCurrentSiteAppSettings, updateCurrentSiteAppSettingsNoCache } from './actions';
import { checkCacheValid } from 'redux-cache';
import axios from 'axios';
import { ArmObj } from '../../../../models/WebAppModels';
import IState from '../../../types';

interface StickySettings {
  connectionStringNames: string[];
  appSettingNames: string[];
  azureStorageConfigNames: string[];
}
export function fetchAppSettings() {
  return async (dispatch: any, getState: () => IState) => {
    const startupInfo = getState().portalService.startupInfo;
    if (!startupInfo) {
      return null;
    }
    const armToken = startupInfo.token;
    const armEndpoint = startupInfo.armEndpoint;
    const resourceId = `${startupInfo.resourceId}/config/appsettings`;
    const currentResourceId = getState().appSettings.resourceId;
    const isCacheValid = checkCacheValid(getState, 'appSettings');
    if (isCacheValid && resourceId === currentResourceId) {
      return getState().appSettings.settings;
    }
    dispatch(updateCurrentSiteAppSettingsNoCache({ loading: true }));
    try {
      const settingsFetch = axios.post<ArmObj<{ [key: string]: string }>>(`${armEndpoint}${resourceId}/list?api-version=2016-03-01`, null, {
        headers: {
          Authorization: `Bearer ${armToken}`,
        },
      });

      const stickyFetch = axios.get<ArmObj<StickySettings>>(
        `${armEndpoint}${startupInfo.resourceId}/config/slotConfigNames?api-version=2018-02-01`,
        {
          headers: {
            Authorization: `Bearer ${armToken}`,
          },
        }
      );

      const [settingsResult, stickyResult] = await Promise.all([settingsFetch, stickyFetch]);
      const settingsData = settingsResult.data;
      const stickyData = stickyResult.data;
      const settings = Object.keys(settingsData.properties).map(key => ({
        name: key,
        value: settingsData.properties[key],
        sticky: stickyData && stickyData.properties.appSettingNames && stickyData.properties.appSettingNames.indexOf(key) > -1,
      }));
      dispatch(
        updateCurrentSiteAppSettings({
          settings,
          loading: false,
          resourceId: settingsData.id,
        })
      );
    } catch (err) {
      console.log(err);
    } finally {
      dispatch(
        updateCurrentSiteAppSettings({
          loading: false,
        })
      );
    }
    return getState().appSettings.settings;
  };
}
