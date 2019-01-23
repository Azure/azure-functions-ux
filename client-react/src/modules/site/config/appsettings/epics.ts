import { combineEpics, Epic } from 'redux-observable';
import { from, of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';

import * as Types from '../../../types';
import {
  fetchAppSettingsFailure,
  fetchAppSettingsRequest,
  fetchAppSettingsSuccess,
  updateAppSettingsFailure,
  updateAppSettingsRequest,
  updateAppSettingsSuccess,
} from './actions';
import { AppSettingsActions } from './reducer';

export const fetchAppSettings: Epic<AppSettingsActions, AppSettingsActions, Types.RootState, Types.Services> = (
  action$,
  store,
  { appSettingsApi }
) =>
  action$.pipe(
    filter(isActionOf(fetchAppSettingsRequest)),
    switchMap(() =>
      from(appSettingsApi.fetchAppSettings(store.value)).pipe(
        map(fetchAppSettingsSuccess),
        catchError(err => of(fetchAppSettingsFailure(err)))
      )
    )
  );

export const updateAppSettings: Epic<AppSettingsActions, AppSettingsActions, Types.RootState, Types.Services> = (
  action$,
  store,
  { appSettingsApi }
) =>
  action$.pipe(
    filter(isActionOf(updateAppSettingsRequest)),
    switchMap(action =>
      from(appSettingsApi.updateAppSettings(store.value, action.appSettings)).pipe(
        map(updateAppSettingsSuccess),
        catchError(err => of(updateAppSettingsFailure(err)))
      )
    )
  );
export default combineEpics(fetchAppSettings, updateAppSettings);
