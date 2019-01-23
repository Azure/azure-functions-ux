import { combineEpics, Epic } from 'redux-observable';
import { from, of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';

import { RootState, Services } from '../../../types';
import {
  fetchSlotConfigFailure,
  fetchSlotConfigRequest,
  fetchSlotConfigSuccess,
  updateSlotConfigFailure,
  updateSlotConfigRequest,
  updateSlotConfigSuccess,
} from './actions';
import { SlotConfigAction } from './reducer';

export const fetchSlotConfigName: Epic<SlotConfigAction, SlotConfigAction, RootState, Services> = (
  action$,
  store,
  { slotConfigNamesApi }
) =>
  action$.pipe(
    filter(isActionOf(fetchSlotConfigRequest)),
    switchMap(() =>
      from(slotConfigNamesApi.fetchSlotConfig(store.value)).pipe(
        map(fetchSlotConfigSuccess),
        catchError(err => of(fetchSlotConfigFailure(err)))
      )
    )
  );

export const updateSlotConfigName: Epic<SlotConfigAction, SlotConfigAction, RootState, Services> = (
  action$,
  store,
  { slotConfigNamesApi }
) =>
  action$.pipe(
    filter(isActionOf(updateSlotConfigRequest)),
    switchMap(action =>
      from(slotConfigNamesApi.updateSlotConfig(store.value, action.slotConfig)).pipe(
        map(updateSlotConfigSuccess),
        catchError(err => of(updateSlotConfigFailure(err)))
      )
    )
  );
export default combineEpics(fetchSlotConfigName, updateSlotConfigName);
