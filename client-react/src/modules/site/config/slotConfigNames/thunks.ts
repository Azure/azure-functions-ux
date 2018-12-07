import { updateCurrentSiteSlotConfigNames, updateCurrentSiteSlotConfigNamesNoCache } from './actions';
import { checkCacheValid } from 'redux-cache';
import axios from 'axios';
import { ArmObj, SlotConfigNames } from '../../../../models/WebAppModels';
import IState from '../../../types';
import { InitialState } from './reducer';

export function fetchSlotConfigNames() {
  return async (dispatch: any, getState: () => IState): Promise<SlotConfigNames> => {
    const startupInfo = getState().portalService.startupInfo;
    if (!startupInfo) {
      return InitialState.slotConfigNames;
    }
    const siteResourceId = getState().site.resourceId;
    const armToken = startupInfo.token;
    const armEndpoint = startupInfo.armEndpoint;
    const resourceId = `${siteResourceId}/config/slotConfigNames`;
    const currentResourceId = getState().slotConfigNames.resourceId;
    const isCacheValid = checkCacheValid(getState, 'slotConfigNames');
    if (isCacheValid && resourceId === currentResourceId) {
      return getState().slotConfigNames.slotConfigNames;
    }
    dispatch(updateCurrentSiteSlotConfigNamesNoCache({ loading: true }));
    try {
      const stickyResult = await axios.get<ArmObj<SlotConfigNames>>(`${armEndpoint}${resourceId}?api-version=2018-02-01`, {
        headers: {
          Authorization: `Bearer ${armToken}`,
        },
      });
      const slotConfigNames = stickyResult.data;

      dispatch(
        updateCurrentSiteSlotConfigNames({
          slotConfigNames: slotConfigNames.properties,
          loading: false,
          resourceId: slotConfigNames.id,
        })
      );
      return slotConfigNames.properties;
    } catch (err) {
      dispatch(
        updateCurrentSiteSlotConfigNamesNoCache({
          loading: false,
        })
      );
      return getState().slotConfigNames.slotConfigNames;
    }
  };
}

export function updateSlotConfigNames(slotConfigNamesUpdated: SlotConfigNames) {
  return async (dispatch: any, getState: () => IState): Promise<void> => {
    const startupInfo = getState().portalService.startupInfo;
    const armToken = startupInfo!.token;
    const armEndpoint = startupInfo!.armEndpoint;
    const siteResourceId = getState().site.resourceId;
    const resourceId = `${siteResourceId}/config/slotConfigNames`;
    dispatch(updateCurrentSiteSlotConfigNamesNoCache({ saving: true }));
    try {
      await axios.put<ArmObj<SlotConfigNames>>(
        `${armEndpoint}${resourceId}?api-version=2018-02-01`,
        { properties: slotConfigNamesUpdated },
        {
          headers: {
            Authorization: `Bearer ${armToken}`,
          },
        }
      );
    } catch (err) {
      console.log(err);
    }
  };
}
