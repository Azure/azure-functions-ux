import { combineEpics, Epic } from 'redux-observable';
import { from, of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';

import { RootState, Services } from '../../types';
import { fetchBillingMetersFailure, fetchBillingMetersRequest, fetchBillingMetersSuccess } from './actions';
import { BillingMetersAction } from './reducer';

export const fetchBillingMeters: Epic<BillingMetersAction, BillingMetersAction, RootState, Services> = (
  action$,
  store,
  { billingMetersApi }
) =>
  action$.pipe(
    filter(isActionOf(fetchBillingMetersRequest)),
    switchMap(action =>
      from(billingMetersApi.fetchBillingMeters(action.subscriptionId, action.osType, action.location)).pipe(
        map(fetchBillingMetersSuccess),
        catchError(err => of(fetchBillingMetersFailure(err)))
      )
    )
  );

export default combineEpics(fetchBillingMeters);
