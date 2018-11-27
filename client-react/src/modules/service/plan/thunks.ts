import { updateCurrentPlan, updateCurrentPlanNoCache } from './actions';
import { checkCacheValid } from 'redux-cache';
import axios from 'axios';
import { ArmObj, ServerFarm } from '../../../models/WebAppModels';
import IState from '../../types';

export function fetchPlan() {
  return async (dispatch: any, getState: () => IState) => {
    const startupInfo = getState().portalService.startupInfo;
    if (!startupInfo) {
      return null;
    }
    const armToken = startupInfo.token;
    const armEndpoint = startupInfo.armEndpoint;
    const currentPlan = getState().plan;
    const isCacheValid = checkCacheValid(getState, 'plan');
    if (isCacheValid && currentPlan.resourceId === currentPlan.plan.id && !currentPlan.loading) {
      return currentPlan.plan;
    }

    dispatch(updateCurrentPlanNoCache({ loading: true }));
    try {
      const planFetch = await axios.get<ArmObj<ServerFarm>>(`${armEndpoint}${currentPlan.resourceId}?api-version=2015-08-01`, {
        headers: {
          Authorization: `Bearer ${armToken}`,
        },
      });
      const planResult = planFetch.data;
      dispatch(updateCurrentPlan({ plan: planResult, loading: false }));
      return planResult;
    } catch (err) {
      console.log(err);
      dispatch(updateCurrentPlan({ loading: false }));
    }
    return null;
  };
}

export function updatePlan(value: ArmObj<ServerFarm>) {
  return async (dispatch: any, getState: () => IState) => {
    const startupInfo = getState().portalService.startupInfo;
    const armToken = startupInfo!.token;
    const armEndpoint = startupInfo!.armEndpoint;
    dispatch(updateCurrentPlanNoCache({ saving: true, updateFailed: false, updateFailedMessage: '' }));

    try {
      const planUpdate = await axios.put<ArmObj<ServerFarm>>(`${armEndpoint}${value.id}?api-version=2015-08-01`, value, {
        headers: {
          Authorization: `Bearer ${armToken}`,
        },
      });

      if (planUpdate.status !== 200) {
        dispatch(updateCurrentPlan({ saving: false, updateFailed: true, updateFailedMessage: planUpdate.statusText }));
      } else {
        const planResult = planUpdate.data;
        dispatch(updateCurrentPlan({ plan: planResult, saving: false, updateFailed: false, updateFailedMessage: '' }));
      }
    } catch (err) {
      console.log(err);
    }
  };
}
