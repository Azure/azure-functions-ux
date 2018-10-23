import { ArmArray } from '../../../models/WebAppModels';
import { IAction } from '../../../models/action';
import { UPDATE_AVAILABLE_STACKS_LOADING, UPDATE_AVAILABLE_STACKS } from './actions';
import { DEFAULT_KEY, generateCacheTTL } from 'redux-cache';
import { AvailableStack } from '../../../models/available-stacks';

export interface IStacksState {
  loading: boolean;
  stacks: ArmArray<AvailableStack>;
}
export const InitialState: IStacksState = {
  [DEFAULT_KEY]: null,
  loading: false,
  stacks: {
    value: [],
  },
};

const stacks = (state = InitialState, action: IAction<any>) => {
  switch (action.type) {
    case UPDATE_AVAILABLE_STACKS_LOADING:
      return { ...state, loading: action.payload };
    case UPDATE_AVAILABLE_STACKS:
      return {
        ...state,
        [DEFAULT_KEY]: generateCacheTTL(60000),
        stacks: action.payload,
      };
    default:
      return state;
  }
};

export default stacks;
