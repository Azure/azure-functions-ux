import { combineEpics, Epic } from 'redux-observable';
import { from, of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';

import { RootState, Services } from '../types';
import { fetchSiteFailure, fetchSiteRequest, fetchSiteSuccess, updateSiteFailure, updateSiteRequest, updateSiteSuccess } from './actions';
import { SiteAction } from './reducer';

export const fetchSiteFlow: Epic<SiteAction, SiteAction, RootState, Services> = (action$, store, { siteApi }) =>
  action$.pipe(
    filter(isActionOf(fetchSiteRequest)),
    switchMap(() =>
      from(siteApi.fetchSite(store.value)).pipe(
        map(fetchSiteSuccess),
        catchError(err => of(fetchSiteFailure(err)))
      )
    )
  );

export const updateSiteFlow: Epic<SiteAction, SiteAction, RootState, Services> = (action$, store, { siteApi }) =>
  action$.pipe(
    filter(isActionOf(updateSiteRequest)),
    switchMap(action =>
      from(siteApi.updateSite(store.value, action.site)).pipe(
        map(updateSiteSuccess),
        catchError(err => of(updateSiteFailure(err)))
      )
    )
  );
export default combineEpics(fetchSiteFlow);
