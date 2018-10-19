import { IAction } from '../../../models/action';
import { ISlotListState } from './reducer';

export const UPDATE_SLOT_LIST = 'UPDATE_SLOT_LIST';
export const updateSlotList = (state: Partial<ISlotListState>): IAction<Partial<ISlotListState>> => ({
  payload: state,
  type: UPDATE_SLOT_LIST,
});

export const UPDATE_SLOT_LIST_NO_CACHE = 'UPDATE_SLOT_LIST_NO_CACHE';
export const updateSlotListNoCache = (state: Partial<ISlotListState>): IAction<Partial<ISlotListState>> => ({
  payload: state,
  type: UPDATE_SLOT_LIST_NO_CACHE,
});
