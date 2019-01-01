import { combineEpics } from 'redux-observable';

import stacks from './modules/service/available-stacks/epics';
import appsettings from './modules/site/config/appsettings/epics';
import connectionstrings from './modules/site/config/connectionstrings/epics';
import metadata from './modules/site/config/metadata/epics';
import slotconfignames from './modules/site/config/slotConfigNames/epics';
import webconfig from './modules/site/config/web/epics';
import site from './modules/site/epics';
import slots from './modules/site/slots/epics';

export default combineEpics(site, appsettings, connectionstrings, metadata, slotconfignames, webconfig, slots, stacks);
