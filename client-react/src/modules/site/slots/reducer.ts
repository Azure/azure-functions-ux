import { ArmArray, Site } from '../../../models/WebAppModels';
import { IAction } from '../../../models/action';
import { UPDATE_SLOT_LIST, UPDATE_SLOT_LIST_NO_CACHE } from './actions';
import { DEFAULT_KEY, generateCacheTTL } from 'redux-cache';

export interface ISlotListState {
  loading: boolean;
  slots: ArmArray<Partial<Site>> | null;
  saving: boolean;
}
export const InitialState: ISlotListState = {
  [DEFAULT_KEY]: null,
  loading: false,
  saving: false,
  slots: null,
};

const slots = (state = InitialState, action: IAction<Partial<ISlotListState>>) => {
  switch (action.type) {
    case UPDATE_SLOT_LIST:
      return {
        ...state,
        [DEFAULT_KEY]: generateCacheTTL(6000),
        ...action.payload,
      };
    case UPDATE_SLOT_LIST_NO_CACHE:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

export default slots;
