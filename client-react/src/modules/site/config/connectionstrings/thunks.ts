import { updateCurrentSiteConnectionStrings, updateCurrentSiteConnectionStringsNoCache } from './actions';
import { checkCacheValid } from 'redux-cache';
import axios from 'axios';
import { ArmObj } from '../../../../models/WebAppModels';
import IState from '../../../types';
interface StickySettings {
  connectionStringNames: string[];
  appSettingNames: string[];
  azureStorageConfigNames: string[];
}
export function fetchConnectionStrings() {
  return async (dispatch: (action: any) => void, getState: () => IState) => {
    const startupInfo = getState().portalService.startupInfo;
    if (!startupInfo) {
      return null;
    }
    const armToken = startupInfo.token;
    const armEndpoint = startupInfo.armEndpoint;
    const resourceId = `${startupInfo.resourceId}/config/connectionStrings`;
    const currentResourceId = getState().connectionStrings.resourceId;
    const isCacheValid = checkCacheValid(getState, 'connectionStrings');
    if (isCacheValid && resourceId === currentResourceId) {
      return getState().connectionStrings.connectionStrings;
    }
    dispatch(updateCurrentSiteConnectionStringsNoCache({ loading: true }));

    try {
      const connectionFetch = await axios.post<ArmObj<any>>(`${armEndpoint}${resourceId}/list?api-version=2016-03-01`, null, {
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

      const [settingsResult, stickyResult] = await Promise.all([connectionFetch, stickyFetch]);
      const settingsData = settingsResult.data;
      const stickyData = stickyResult.data;
      const connectionStrings = Object.keys(settingsData.properties).map(key => ({
        name: key,
        value: settingsData.properties[key].value,
        type: settingsData.properties[key].type,
        sticky: stickyData && stickyData.properties.connectionStringNames && stickyData.properties.connectionStringNames.indexOf(key) > -1,
      }));
      dispatch(
        updateCurrentSiteConnectionStrings({
          connectionStrings,
          resourceId: settingsData.id,
          loading: false,
        })
      );
      return connectionStrings;
    } catch (err) {
      console.log(err);
    } finally {
      dispatch(
        updateCurrentSiteConnectionStrings({
          loading: false,
        })
      );
    }
    return getState().connectionStrings.connectionStrings;
  };
}
