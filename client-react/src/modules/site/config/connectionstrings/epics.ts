import { combineEpics, Epic } from 'redux-observable';
import { from, of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { isActionOf, isOfType } from 'typesafe-actions';

import * as Types from '../../../types';
import {
  fetchConnectionStringsFailure,
  fetchConnectionStringsSuccess,
  updateConnectionStringsFailure,
  updateConnectionStringsRequest,
  updateConnectionStringsSuccess,
} from './actions';
import { CONNECTION_STRINGS_FETCH_REQUEST } from './actionTypes';
import { ConnectionStringActions } from './reducer';

export const fetchConnectionStrings: Epic<ConnectionStringActions, ConnectionStringActions, Types.RootState, Types.Services> = (
  action$,
  store,
  { connectionStringsApi }
) =>
  action$.pipe(
    filter(isOfType(CONNECTION_STRINGS_FETCH_REQUEST)),
    switchMap(() =>
      from(connectionStringsApi.fetchConnectionStrings(store.value)).pipe(
        map(fetchConnectionStringsSuccess),
        catchError(err => of(fetchConnectionStringsFailure(err)))
      )
    )
  );

export const updateConnectionStrings: Epic<ConnectionStringActions, ConnectionStringActions, Types.RootState, Types.Services> = (
  action$,
  store,
  { connectionStringsApi }
) =>
  action$.pipe(
    filter(isActionOf(updateConnectionStringsRequest)),
    switchMap(action =>
      from(connectionStringsApi.updateConnectionStrings(store.value, action.connectionStrings)).pipe(
        map(updateConnectionStringsSuccess),
        catchError(err => of(updateConnectionStringsFailure(err)))
      )
    )
  );

export default combineEpics(fetchConnectionStrings, updateConnectionStrings);
