import { IAction } from '../../../../models/action';
import { DEFAULT_KEY, generateCacheTTL } from 'redux-cache';
import { UPDATE_SITE_SLOT_CONFIG_NAMES, UPDATE_SITE_SLOT_CONFIG_NAMES_NO_CACHE } from './actions';
import { SlotConfigNames } from '../../../../models/WebAppModels';

export interface ISlotConfigNamesState {
  loading: boolean;
  saving: boolean;
  resourceId: string;
  slotConfigNames: SlotConfigNames;
}
export const InitialState: ISlotConfigNamesState = {
  [DEFAULT_KEY]: null,
  loading: false,
  resourceId: '',
  saving: false,
  slotConfigNames: {
    appSettingNames: [],
    connectionStringNames: [],
    azureStorageConfigNames: [],
  },
};

const slotConfigNames = (state = InitialState, action: IAction<any>) => {
  switch (action.type) {
    case UPDATE_SITE_SLOT_CONFIG_NAMES:
      return {
        ...state,
        [DEFAULT_KEY]: generateCacheTTL(60000),
        ...action.payload,
      };
    case UPDATE_SITE_SLOT_CONFIG_NAMES_NO_CACHE:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

export default slotConfigNames;
