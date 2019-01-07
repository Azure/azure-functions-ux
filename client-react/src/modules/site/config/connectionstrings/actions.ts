import { createStandardAction } from 'typesafe-actions';

import { ArmObj, Site } from '../../../../models/WebAppModels';
import {
  CONNECTION_STRINGS_FETCH_FAILURE,
  CONNECTION_STRINGS_FETCH_REQUEST,
  CONNECTION_STRINGS_FETCH_SUCCESS,
  CONNECTION_STRINGS_UPDATE_FAILURE,
  CONNECTION_STRINGS_UPDATE_REQUEST,
  CONNECTION_STRINGS_UPDATE_SUCCESS,
  UPDATE_CONNECTION_STRINGS_FROM_SITE_UPDATE,
} from './actionTypes';
import { ConnectionString } from './reducer';

export const fetchConnectionStringsRequest = createStandardAction(CONNECTION_STRINGS_FETCH_REQUEST)();
export const fetchConnectionStringsSuccess = createStandardAction(CONNECTION_STRINGS_FETCH_SUCCESS).map(
  (connectionStrings: ArmObj<ConnectionString>) => ({
    connectionStrings,
  })
);
export const fetchConnectionStringsFailure = createStandardAction(CONNECTION_STRINGS_FETCH_FAILURE).map((error: Error) => ({
  error,
}));

export const updateConnectionStringsRequest = createStandardAction(CONNECTION_STRINGS_UPDATE_REQUEST).map(
  (connectionStrings: ArmObj<ConnectionString>) => ({
    connectionStrings,
  })
);

export const updateConnectionStringsSuccess = createStandardAction(CONNECTION_STRINGS_UPDATE_SUCCESS).map(
  (connectionStrings: ArmObj<ConnectionString>) => ({
    connectionStrings,
  })
);

export const updateConnectionStringsFailure = createStandardAction(CONNECTION_STRINGS_UPDATE_FAILURE).map((error: Error) => ({
  error,
}));

export const updateConnectionStringsFromSiteUpdate = createStandardAction(UPDATE_CONNECTION_STRINGS_FROM_SITE_UPDATE).map(
  (site: ArmObj<Site>) => {
    const connectionStringsFromSite = !!site.properties && !!site.properties.siteConfig && site.properties.siteConfig.connectionStrings;
    if (connectionStringsFromSite) {
      const updatedConnectionStrings: ConnectionString = {};
      connectionStringsFromSite.forEach(cs => {
        updatedConnectionStrings[cs.name] = { value: cs.connectionString, type: cs.type };
      });
      return { connectionStrings: updatedConnectionStrings };
    }
    return { connectionStrings: null };
  }
);
