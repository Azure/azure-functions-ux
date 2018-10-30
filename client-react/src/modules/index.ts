import { combineReducers } from 'redux';
import functionQuickCreate from './app/function-quick-create/reducer';
import portalService from './portal/portal-service-reducer';
import site from './site/reducer';
import webConfig from './site/config/web/reducer';
import metadata from './site/config/metadata/reducer';
import appSettings from './site/config/appsettings/reducer';
import stacks from './service/available-stacks/reducer';
import connectionStrings from './site/config/connectionstrings/reducer';
import slots from './site/slots/reducer';
import rbac from './service/rbac/reducer';

export const reducers = combineReducers({
  portalService,
  functionQuickCreate,
  /*ARM values */
  site,
  webConfig,
  metadata,
  appSettings,
  connectionStrings,
  stacks,
  slots,
  rbac,
});
