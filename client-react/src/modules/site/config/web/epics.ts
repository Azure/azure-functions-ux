import { combineEpics, Epic } from 'redux-observable';
import { from, of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';

import * as Types from '../../../types';
import {
  fetchWebConfigFailure,
  fetchWebConfigRequest,
  fetchWebConfigSuccess,
  updateWebConfigFailure,
  updateWebConfigRequest,
  updateWebConfigSuccess,
} from './actions';
import { ConfigAction } from './reducer';

export const fetchWebConfig: Epic<ConfigAction, ConfigAction, Types.RootState, Types.Services> = (action$, store, { webConfigApi }) =>
  action$.pipe(
    filter(isActionOf(fetchWebConfigRequest)),
    switchMap(() =>
      from(webConfigApi.fetchWebConfig(store.value)).pipe(
        map(fetchWebConfigSuccess),
        catchError(err => of(fetchWebConfigFailure(err)))
      )
    )
  );

export const updateWebConfig: Epic<ConfigAction, ConfigAction, Types.RootState, Types.Services> = (action$, store, { webConfigApi }) =>
  action$.pipe(
    filter(isActionOf(updateWebConfigRequest)),
    switchMap(action =>
      from(webConfigApi.updateWebConfig(store.value, action.webConfig)).pipe(
        map(updateWebConfigSuccess),
        catchError(err => of(updateWebConfigFailure(err)))
      )
    )
  );
export default combineEpics(fetchWebConfig, updateWebConfig);
