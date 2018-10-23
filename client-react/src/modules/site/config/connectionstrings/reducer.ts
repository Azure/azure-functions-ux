import { IAction } from '../../../../models/action';
import { UPDATE_SITE_CONNECTION_STRINGS, UPDATE_SITE_CONNECTION_STRINGS_NO_CACHE } from './actions';
import { DEFAULT_KEY, generateCacheTTL } from 'redux-cache';
import { ConnectionString } from './connectionstrings.types';

export interface IConnectionStringState {
  loading: boolean;
  resourceId: string;
  connectionStrings: ConnectionString[];
  saving: boolean;
}
export const InitialState: IConnectionStringState = {
  [DEFAULT_KEY]: null,
  loading: false,
  resourceId: '',
  saving: false,
  connectionStrings: [],
};

const connectionStrings = (state = InitialState, action: IAction<Partial<IConnectionStringState>>) => {
  switch (action.type) {
    case UPDATE_SITE_CONNECTION_STRINGS:
      return {
        ...state,
        [DEFAULT_KEY]: generateCacheTTL(60000),
        ...action.payload,
      };
    case UPDATE_SITE_CONNECTION_STRINGS_NO_CACHE:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

export default connectionStrings;
