import { createStandardAction } from 'typesafe-actions';

import { ArmObj, SlotConfigNames } from '../../../../models/WebAppModels';
import {
  SLOT_CONFIG_FETCH_FAILURE,
  SLOT_CONFIG_FETCH_REQUEST,
  SLOT_CONFIG_FETCH_SUCCESS,
  SLOT_CONFIG_UPDATE_FAILURE,
  SLOT_CONFIG_UPDATE_REQUEST,
  SLOT_CONFIG_UPDATE_SUCCESS,
} from './actionTypes';

export const fetchSlotConfigRequest = createStandardAction(SLOT_CONFIG_FETCH_REQUEST)();
export const fetchSlotConfigSuccess = createStandardAction(SLOT_CONFIG_FETCH_SUCCESS).map((slotConfig: ArmObj<SlotConfigNames>) => ({
  slotConfig,
}));
export const fetchSlotConfigFailure = createStandardAction(SLOT_CONFIG_FETCH_FAILURE).map((error: Error) => ({
  error,
}));

export const updateSlotConfigRequest = createStandardAction(SLOT_CONFIG_UPDATE_REQUEST).map((slotConfig: ArmObj<SlotConfigNames>) => ({
  slotConfig,
}));
export const updateSlotConfigSuccess = createStandardAction(SLOT_CONFIG_UPDATE_SUCCESS).map((slotConfig: ArmObj<SlotConfigNames>) => ({
  slotConfig,
}));
export const updateSlotConfigFailure = createStandardAction(SLOT_CONFIG_UPDATE_FAILURE).map((error: Error) => ({
  error,
}));
