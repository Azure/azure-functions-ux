import { ArmObj, ServerFarm } from '../../models/WebAppModels';
import { IAction } from '../../models/action';
import { UPDATE_PLAN, UPDATE_PLAN_NO_CACHE } from './actions';
import { DEFAULT_KEY, generateCacheTTL } from 'redux-cache';

export interface IPlanState {
  loading: boolean;
  plan: ArmObj<ServerFarm>;
  resourceId: string;
  saving: boolean;
  updateFailed: boolean;
  updateFailedMessage: string;
}
export const InitialState: IPlanState = {
  [DEFAULT_KEY]: null,
  loading: false,
  saving: false,
  resourceId: '',
  plan: {
    id: '',
    properties: {} as any,
    name: '',
    location: '',
    kind: '',
  },
  updateFailed: false,
  updateFailedMessage: '',
};

const plan = (state = InitialState, action: IAction<Partial<IPlanState> | string>) => {
  switch (action.type) {
    case UPDATE_PLAN:
      return {
        ...state,
        [DEFAULT_KEY]: generateCacheTTL(6000),
        ...(action.payload as Partial<IPlanState>),
      };
    case UPDATE_PLAN_NO_CACHE:
      return {
        ...state,
        ...(action.payload as Partial<IPlanState>),
      };
    default:
      return state;
  }
};

export default plan;
