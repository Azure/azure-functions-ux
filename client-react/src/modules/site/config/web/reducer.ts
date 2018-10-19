import { ArmObj, SiteConfig, VirtualApplication } from '../../../../models/WebAppModels';
import { IAction } from '../../../../models/action';
import { UPDATE_SITE_CONFIG_WEB, UPDATE_SITE_CONFIG_WEB_NO_CACHE } from './actions';
import { DEFAULT_KEY, generateCacheTTL } from 'redux-cache';

export interface IWebConfigState {
  loading: boolean;
  config: ArmObj<SiteConfig>;
  virtualApplications: VirtualApplication[];
  currentlySelectedStack: string;
  saving: boolean;
}
export const InitialState: IWebConfigState = {
  [DEFAULT_KEY]: null,
  loading: false,
  saving: false,
  currentlySelectedStack: '',
  config: {
    id: '',
    properties: {} as any,
    name: '',
    location: '',
    kind: '',
  },
  virtualApplications: [],
};

const webConfig = (state = InitialState, action: IAction<Partial<IWebConfigState>>) => {
  switch (action.type) {
    case UPDATE_SITE_CONFIG_WEB:
      return {
        ...state,
        [DEFAULT_KEY]: generateCacheTTL(6000),
        ...action.payload,
      };
    case UPDATE_SITE_CONFIG_WEB_NO_CACHE:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

export default webConfig;
