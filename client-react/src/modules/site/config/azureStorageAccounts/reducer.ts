import { combineReducers } from 'redux';
import { ActionType } from 'typesafe-actions';

import { ArmObj } from '../../../../models/WebAppModels';
import { metadataReducer } from '../../../ApiReducerHelper';
import { ApiState } from '../../../types';
import * as actions from './actions';
import {
  AZURE_STORAGE_MOUNT_FETCH_SUCCESS,
  AZURE_STORAGE_MOUNT_UPDATE_SUCCESS,
  AREA_STRING,
  UPDATE_AZURE_STORAGE_MOUNT_FROM_SITE_UPDATE,
} from './actionTypes';

export enum StorageType {
  azureFiles = 'AzureFiles',
  azureBlob = 'AzureBlob',
}

export type AzureStorageMount = {
  type: StorageType;
  accountName: string;
  shareName: string;
  accessKey: string;
  mountPath: string;
};

export type ArmAzureStorageMount = {
  [key: string]: AzureStorageMount;
};
export type AzureStorageMountActions = ActionType<typeof actions>;
export type AzureStorageMountState = ApiState<ArmObj<ArmAzureStorageMount>>;

export const InitialState = {
  data: {
    id: '',
    properties: {},
    name: '',
    location: '',
    kind: '',
  },
};

export default combineReducers<AzureStorageMountState, AzureStorageMountActions>({
  metadata: metadataReducer(AREA_STRING),
  data: (state = InitialState.data, action) => {
    switch (action.type) {
      case AZURE_STORAGE_MOUNT_FETCH_SUCCESS:
        return action.azureMount;
      case AZURE_STORAGE_MOUNT_UPDATE_SUCCESS:
        return action.azureMount;
      case UPDATE_AZURE_STORAGE_MOUNT_FROM_SITE_UPDATE:
        return { ...state, properties: action.azureStorageMount ? action.azureStorageMount : state.properties };
      default:
        return state;
    }
  },
});
