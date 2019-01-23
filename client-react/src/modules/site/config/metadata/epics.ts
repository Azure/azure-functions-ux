import { combineEpics, Epic } from 'redux-observable';
import { from, of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';

import * as Types from '../../../types';
import {
  fetchMetadataFailure,
  fetchMetadataRequest,
  fetchMetadataSuccess,
  updateMetadataFailure,
  updateMetadataRequest,
  updateMetadataSuccess,
} from './actions';
import { MetadataAction } from './reducer';

export const fetchMetadata: Epic<MetadataAction, MetadataAction, Types.RootState, Types.Services> = (action$, store, { metadataApi }) =>
  action$.pipe(
    filter(isActionOf(fetchMetadataRequest)),
    switchMap(() =>
      from(metadataApi.fetchMetadata(store.value)).pipe(
        map(fetchMetadataSuccess),
        catchError(err => of(fetchMetadataFailure(err)))
      )
    )
  );

export const updateMetadata: Epic<MetadataAction, MetadataAction, Types.RootState, Types.Services> = (action$, store, { metadataApi }) =>
  action$.pipe(
    filter(isActionOf(updateMetadataRequest)),
    switchMap(action =>
      from(metadataApi.updateMetadata(store.value, action.metadata)).pipe(
        map(updateMetadataSuccess),
        catchError(err => of(updateMetadataFailure(err)))
      )
    )
  );

export default combineEpics(fetchMetadata, updateMetadata);
