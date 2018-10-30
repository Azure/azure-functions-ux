import { ArmObj } from '../../../../models/WebAppModels';
import { IAction } from '../../../../models/action';
import { UPDATE_SITE_CONFIG_METADATA, UPDATE_SITE_CONFIG_METADATA_LOADING, UPDATE_SITE_CONFIG_METADATA_SAVING } from './actions';
import { DEFAULT_KEY, generateCacheTTL } from 'redux-cache';

export interface IMetadataConfigState {
  loading: boolean;
  metadata: ArmObj<{ [key: string]: string }>;
  saving: boolean;
}
export const InitialState: IMetadataConfigState = {
  [DEFAULT_KEY]: null,
  loading: false,
  saving: false,
  metadata: {
    id: '',
    properties: {},
    name: '',
    location: '',
    kind: '',
  },
};

const metadata = (state = InitialState, action: IAction<any>) => {
  switch (action.type) {
    case UPDATE_SITE_CONFIG_METADATA_LOADING:
      return { ...state, loading: action.payload };
    case UPDATE_SITE_CONFIG_METADATA_SAVING:
      return { ...state, saving: action.payload };
    case UPDATE_SITE_CONFIG_METADATA:
      return {
        ...state,
        [DEFAULT_KEY]: generateCacheTTL(6000),
        config: action.payload,
      };
    default:
      return state;
  }
};

export default metadata;
