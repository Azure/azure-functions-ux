import { combineEpics, Epic } from 'redux-observable';
import { filter, tap, ignoreElements } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';

import { getStartupInfoAction, updateToken } from './actions';
import { updateEndpoint, updateAuthToken } from '../ArmHelper';

export const startupInfoSideEffects: Epic = (action$, store) =>
  action$.pipe(
    filter(isActionOf(getStartupInfoAction)),
    tap(action => {
      updateEndpoint(action.startupInfo.armEndpoint);
      updateAuthToken(action.startupInfo.token);
    }),
    ignoreElements()
  );

export const newTokenSideEffects: Epic = (action$, store) =>
  action$.pipe(
    filter(isActionOf(updateToken)),
    tap(action => {
      updateAuthToken(action.token);
    }),
    ignoreElements()
  );
export default combineEpics(startupInfoSideEffects, newTokenSideEffects);
