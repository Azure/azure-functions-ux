import { StateType } from 'typesafe-actions';

import rootReducer from './';
import { StacksAction } from './service/available-stacks/reducer';
import services from './services';
import { AppSettingsActions } from './site/config/appsettings/reducer';
import { ConnectionStringActions } from './site/config/connectionstrings/reducer';
import { MetadataAction } from './site/config/metadata/reducer';
import { SlotConfigAction } from './site/config/slotConfigNames/reducer';
import { ConfigAction } from './site/config/web/reducer';
import { SiteAction } from './site/reducer';
import { SlotsAction } from './site/slots/reducer';
import { AxiosError } from 'axios';
import { LogStreamActions } from './site/config/logstream/reducer';

export type RootState = StateType<typeof rootReducer>;
export type RootAction =
  | SiteAction
  | SlotsAction
  | ConfigAction
  | SlotConfigAction
  | MetadataAction
  | ConnectionStringActions
  | AppSettingsActions
  | StacksAction
  | LogStreamActions;

export type Services = typeof services;

export interface ApiStateMetadata {
  fetchError: boolean;
  fetchErrorObject: AxiosError | Error;
  updateError: boolean;
  updateErrorObject: AxiosError | Error;
  loading: boolean;
  updating: boolean;
}

export interface ApiState<T> {
  metadata: ApiStateMetadata;
  data: T;
}
