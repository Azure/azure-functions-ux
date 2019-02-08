import { combineEpics, Epic } from 'redux-observable';
import { from, of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';

import * as Types from '../../../types';
import {
  fetchAzureStorageMountRequest,
  fetchAzureStorageMountSuccess,
  fetchAzureStorageMountFailure,
  updateAzureStorageMountRequest,
  updateAzureStorageMountSuccess,
  updateAzureStorageMountFailure,
} from './actions';
import { AzureStorageMountActions } from './reducer';

export const fetchAzureStorageMount: Epic<AzureStorageMountActions, AzureStorageMountActions, Types.RootState, Types.Services> = (
  action$,
  store,
  { azureMountApi }
) =>
  action$.pipe(
    filter(isActionOf(fetchAzureStorageMountRequest)),
    switchMap(() =>
      from(azureMountApi.fetchAzureStorageMount(store.value)).pipe(
        map(fetchAzureStorageMountSuccess),
        catchError(err => of(fetchAzureStorageMountFailure(err)))
      )
    )
  );

export const updateAzureStorageMount: Epic<AzureStorageMountActions, AzureStorageMountActions, Types.RootState, Types.Services> = (
  action$,
  store,
  { azureMountApi }
) =>
  action$.pipe(
    filter(isActionOf(updateAzureStorageMountRequest)),
    switchMap(action =>
      from(azureMountApi.updateAzureStorageMount(store.value, action.azureMount)).pipe(
        map(updateAzureStorageMountSuccess),
        catchError(err => of(updateAzureStorageMountFailure(err)))
      )
    )
  );
export default combineEpics(fetchAzureStorageMount, updateAzureStorageMount);
