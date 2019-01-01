import { createStandardAction } from 'typesafe-actions';

import { ArmArray, Site } from '../../../models/WebAppModels';
import { SLOTS_FETCH_FAILURE, SLOTS_FETCH_REQUEST, SLOTS_FETCH_SUCCESS } from './actionTypes';

export const fetchSlotsRequest = createStandardAction(SLOTS_FETCH_REQUEST)();
export const fetchSlotsSuccess = createStandardAction(SLOTS_FETCH_SUCCESS).map((slotList: ArmArray<Site>) => ({ slotList }));
export const fetchSlotsFailure = createStandardAction(SLOTS_FETCH_FAILURE).map((error: Error) => ({
  error,
}));
