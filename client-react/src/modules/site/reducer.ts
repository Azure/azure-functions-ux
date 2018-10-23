import { ArmObj, Site } from '../../models/WebAppModels';
import { IAction } from '../../models/action';
import { UPDATE_SITE, UPDATE_RESOURCE_ID, UPDATE_SITE_NO_CACHE } from './actions';
import { DEFAULT_KEY, generateCacheTTL } from 'redux-cache';

export interface ISiteState {
  loading: boolean;
  site: ArmObj<Site>;
  resourceId: string;
  saving: boolean;
}
export const InitialState: ISiteState = {
  [DEFAULT_KEY]: null,
  loading: false,
  saving: false,
  resourceId: '',
  site: {
    id: '',
    properties: {} as any,
    name: '',
    location: '',
    kind: '',
  },
};

const site = (state = InitialState, action: IAction<Partial<ISiteState> | string>) => {
  switch (action.type) {
    case UPDATE_SITE:
      return {
        ...state,
        [DEFAULT_KEY]: generateCacheTTL(6000),
        ...(action.payload as Partial<ISiteState>),
      };
    case UPDATE_SITE_NO_CACHE:
      return {
        ...state,
        ...(action.payload as Partial<ISiteState>),
      };
    case UPDATE_RESOURCE_ID:
      return { ...state, resourceId: action.payload };
    default:
      return state;
  }
};

export default site;
