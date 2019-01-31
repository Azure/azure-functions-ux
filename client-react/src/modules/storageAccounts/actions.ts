import { createStandardAction } from 'typesafe-actions';

import { StorageAccount, ArmArray } from '../../models/WebAppModels';
import { STORAGE_ACCOUNTS_FETCH_FAILURE, STORAGE_ACCOUNTS_FETCH_REQUEST, STORAGE_ACCOUNTS_FETCH_SUCCESS } from './actionTypes';

export const fetchStorageAccountsRequest = createStandardAction(STORAGE_ACCOUNTS_FETCH_REQUEST)();
export const fetchStorageAccountsSuccess = createStandardAction(STORAGE_ACCOUNTS_FETCH_SUCCESS).map(
  (accounts: ArmArray<StorageAccount>) => ({
    accounts,
  })
);
export const fetchStorageAccountsFailure = createStandardAction(STORAGE_ACCOUNTS_FETCH_FAILURE).map((error: Error) => ({
  error,
}));
