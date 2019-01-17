import { combineEpics, Epic } from 'redux-observable';
import { from, of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { isOfType } from 'typesafe-actions';

import { RootState, Services } from '../../types';
import { fetchStacksFailure, fetchStacksSuccess } from './actions';
import { STACKS_FETCH_REQUEST } from './actionTypes';
import { StacksAction } from './reducer';

export const fetchStacksFlow: Epic<StacksAction, StacksAction, RootState, Services> = (action$, store, { stacksApi }) =>
  action$.pipe(
    filter(isOfType(STACKS_FETCH_REQUEST)),
    switchMap(action =>
      from(stacksApi.fetchAvailableStacks(action.stackOs)).pipe(
        map(fetchStacksSuccess),
        catchError(err => of(fetchStacksFailure(err)))
      )
    )
  );

export default combineEpics(fetchStacksFlow);
