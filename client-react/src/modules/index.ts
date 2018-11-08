import { combineReducers } from 'redux';

import portalService from './portal/reducer';
import stacks from './service/available-stacks/reducer';
import billingMeters from './service/billing/reducer';
import rbac from './service/rbac/reducer';
import appSettings from './site/config/appsettings/reducer';
import connectionStrings from './site/config/connectionstrings/reducer';
import metadata from './site/config/metadata/reducer';
import slotConfigNames from './site/config/slotConfigNames/reducer';
import webConfig from './site/config/web/reducer';
import site from './site/reducer';
import slots from './site/slots/reducer';
import 'react-app-polyfill/ie11';
import logStream from './site/config/logstream/reducer';

const rootReducer = combineReducers({
  portalService,
  /*ARM values */
  site,
  webConfig,
  metadata,
  appSettings,
  connectionStrings,
  stacks,
  slots,
  rbac,
  slotConfigNames,
  billingMeters,
  logStream,
});

export default rootReducer;
