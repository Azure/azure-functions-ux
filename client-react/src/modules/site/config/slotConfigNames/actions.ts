import { IAction } from '../../../../models/action';
import { ISlotConfigNamesState } from './reducer';

export const UPDATE_SITE_SLOT_CONFIG_NAMES = 'UPDATE_SITE_SLOT_CONFIG_NAMES';
export const updateCurrentSiteSlotConfigNames = (
  slotConfigNames: Partial<ISlotConfigNamesState>
): IAction<Partial<ISlotConfigNamesState>> => ({
  payload: slotConfigNames,
  type: UPDATE_SITE_SLOT_CONFIG_NAMES,
});

export const UPDATE_SITE_SLOT_CONFIG_NAMES_NO_CACHE = 'UPDATE_SITE_SLOT_CONFIG_NAMES_NO_CACHE';
export const updateCurrentSiteSlotConfigNamesNoCache = (
  slotConfigNames: Partial<ISlotConfigNamesState>
): IAction<Partial<ISlotConfigNamesState>> => ({
  payload: slotConfigNames,
  type: UPDATE_SITE_SLOT_CONFIG_NAMES_NO_CACHE,
});
