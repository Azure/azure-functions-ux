import LogService from './utils/LogService';
import { FETCH_REQUEST, FETCH_SUCCESS, FETCH_FAILURE, UPDATE_REQUEST, UPDATE_SUCCESS, UPDATE_FAILURE } from './modules/ApiReducerHelper';
import { Epic, combineEpics } from 'redux-observable';
import { tap, ignoreElements, filter } from 'rxjs/operators';

//All actions called for action order
const logSyncActionsCalled: Epic = action$ =>
  action$.pipe(
    tap(action => {
      LogService.trackEvent('redux-action', 'action-called', { actionType: action.type });
    }),
    ignoreElements()
  );

//Fetch timings Logging
const logFetchActionStart: Epic = action$ =>
  action$.pipe(
    filter(action => action.type.includes(FETCH_REQUEST)),
    tap(action => {
      const actionArea = action.type.split('/')[0];
      LogService.startTrackEvent(`${actionArea} - fetch`);
    }),
    ignoreElements()
  );

const logFetchActionSucess: Epic = action$ =>
  action$.pipe(
    filter(action => action.type.includes(FETCH_SUCCESS)),
    tap(action => {
      const actionArea = action.type.split('/')[0];
      LogService.stopTrackEvent(`${actionArea} - fetch`, {
        success: true,
      });
    }),
    ignoreElements()
  );

const logFetchActionFailure: Epic = action$ =>
  action$.pipe(
    filter(action => action.type.includes(FETCH_FAILURE)),
    tap(action => {
      const actionArea = action.type.split('/')[0];
      LogService.stopTrackEvent(`${actionArea} - fetch`, {
        error: action.error,
        success: false,
      });
    }),
    ignoreElements()
  );

//Update timings Logging
const logUpdateActionStart: Epic = action$ =>
  action$.pipe(
    filter(action => action.type.includes(UPDATE_REQUEST)),
    tap(action => {
      const actionArea = action.type.split('/')[0];
      LogService.startTrackEvent(`${actionArea} - update`);
    }),
    ignoreElements()
  );

const logUpdateActionSucess: Epic = action$ =>
  action$.pipe(
    filter(action => action.type.includes(UPDATE_SUCCESS)),
    tap(action => {
      const actionArea = action.type.split('/')[0];
      LogService.stopTrackEvent(`${actionArea} - update`, {
        successs: true,
      });
    }),
    ignoreElements()
  );

const logUpdateActionFailure: Epic = action$ =>
  action$.pipe(
    filter(action => action.type.includes(UPDATE_FAILURE)),
    tap(action => {
      const actionArea = action.type.split('/')[0];
      LogService.stopTrackEvent(`${actionArea} - update`, {
        success: false,
        error: action.error,
      });
    }),
    ignoreElements()
  );

export default combineEpics(
  logSyncActionsCalled,
  logFetchActionFailure,
  logFetchActionStart,
  logFetchActionSucess,
  logUpdateActionFailure,
  logUpdateActionStart,
  logUpdateActionSucess
);
