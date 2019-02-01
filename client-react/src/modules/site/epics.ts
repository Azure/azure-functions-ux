import { combineEpics, Epic } from 'redux-observable';
import { from, of, concat } from 'rxjs';
import { catchError, filter, map, switchMap, flatMap } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';

import { RootState, Services } from '../types';
import { fetchSiteFailure, fetchSiteRequest, fetchSiteSuccess, updateSiteFailure, updateSiteRequest, updateSiteSuccess } from './actions';
import { SiteAction } from './reducer';
import { updateAppSettingsFromSiteUpdate } from './config/appsettings/actions';
import { AnyAction } from 'redux';
import { updateConnectionStringsFromSiteUpdate } from './config/connectionstrings/actions';
import { updateMetadataFromSiteUpdate } from './config/metadata/actions';
import { updateAzureStorageMountFromSiteUpdate } from './config/azureStorageAccounts/actions';

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

export const updateSiteFlow: Epic<SiteAction, AnyAction, RootState, Services> = (action$, store, { siteApi }) =>
  action$.pipe(
    filter(isActionOf(updateSiteRequest)),
    switchMap(action =>
      from(siteApi.updateSite(store.value, action.site)).pipe(
        flatMap(updatedSite => {
          return concat(
            of(updateSiteSuccess(updatedSite)),
            of(updateAppSettingsFromSiteUpdate(action.site)),
            of(updateConnectionStringsFromSiteUpdate(action.site)),
            of(updateMetadataFromSiteUpdate(action.site)),
            of(updateAzureStorageMountFromSiteUpdate(action.site))
          );
        }),
        catchError(err => of(updateSiteFailure(err)))
      )
    )
  );
export default combineEpics(fetchSiteFlow, updateSiteFlow);
