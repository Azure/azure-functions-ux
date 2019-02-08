import { combineEpics, Epic } from 'redux-observable';
import { from, of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';

import { RootState, Services } from '../types';
import { StorageAccountAction } from './reducer';
import { fetchStorageAccountsRequest, fetchStorageAccountsSuccess, fetchStorageAccountsFailure } from './actions';

export const fetchStorageAccounts: Epic<StorageAccountAction, StorageAccountAction, RootState, Services> = (
  action$,
  store,
  { storageAccountsApi }
) =>
  action$.pipe(
    filter(isActionOf(fetchStorageAccountsRequest)),
    switchMap(() =>
      from(storageAccountsApi.fetchStorageAccounts(store.value)).pipe(
        map(fetchStorageAccountsSuccess),
        catchError(err => of(fetchStorageAccountsFailure(err)))
      )
    )
  );

export default combineEpics(fetchStorageAccounts);
