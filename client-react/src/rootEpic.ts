import { combineEpics } from 'redux-observable';
import stacks from './modules/service/available-stacks/epics';
import appSettings from './modules/site/config/appsettings/epics';
import connectionStrings from './modules/site/config/connectionstrings/epics';
import metadata from './modules/site/config/metadata/epics';
import slotConfigNames from './modules/site/config/slotConfigNames/epics';
import webConfig from './modules/site/config/web/epics';
import site from './modules/site/epics';
import slots from './modules/site/slots/epics';
import portal from './modules/portal/epics';
import loggingEpics from './LoggingEpics';
import azureStorageMounts from './modules/site/config/azureStorageAccounts/epics';
import azureStorageAccounts from './modules/storageAccounts/epics';
export default combineEpics(
  site,
  appSettings,
  connectionStrings,
  metadata,
  slotConfigNames,
  webConfig,
  slots,
  stacks,
  portal,
  loggingEpics,
  azureStorageMounts,
  azureStorageAccounts
);
