import { combineEpics, Epic } from 'redux-observable';
import { from, of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { isOfType } from 'typesafe-actions';

import * as Types from '../../types';
import { fetchSlotsFailure, fetchSlotsSuccess } from './actions';
import { SLOTS_FETCH_REQUEST } from './actionTypes';
import { SlotsAction } from './reducer';

export const fetchSlotsFlow: Epic<SlotsAction, SlotsAction, Types.RootState, Types.Services> = (action$, store, { slotsApi }) =>
  action$.pipe(
    filter(isOfType(SLOTS_FETCH_REQUEST)),
    switchMap(() =>
      from(slotsApi.fetchSlots(store.value)).pipe(
        map(fetchSlotsSuccess),
        catchError(err => of(fetchSlotsFailure(err)))
      )
    )
  );
export default combineEpics(fetchSlotsFlow);
