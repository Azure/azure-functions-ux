import { updateCurrentSiteConnectionStrings, updateCurrentSiteConnectionStringsNoCache } from './actions';
import { checkCacheValid } from 'redux-cache';
import axios from 'axios';
import { ArmObj } from '../../../../models/WebAppModels';
import IState from '../../../types';
import { fetchSlotConfigNames } from '../slotConfigNames/thunks';
import { CommonConstants } from 'src/utils/CommonConstants';

export function fetchConnectionStrings() {
  return async (dispatch: (action: any) => any, getState: () => IState) => {
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
      const connectionFetch = await axios.post<ArmObj<any>>(
        `${armEndpoint}${resourceId}/list?api-version=${CommonConstants.ApiVersions.websiteApiVersion20180201}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${armToken}`,
          },
        }
      );

      const stickyFetch = dispatch(fetchSlotConfigNames());

      const [settingsResult, stickyResult] = await Promise.all([connectionFetch, stickyFetch]);
      const settingsData = settingsResult.data;
      const { connectionStringNames } = stickyResult;
      const connectionStrings = Object.keys(settingsData.properties).map(key => ({
        name: key,
        value: settingsData.properties[key].value,
        type: settingsData.properties[key].type,
        sticky: connectionStringNames && connectionStringNames.indexOf(key) > -1,
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
