import { createStandardAction } from 'typesafe-actions';

import { ArmObj, Site } from '../../../../models/WebAppModels';
import {
  AZURE_STORAGE_MOUNT_FETCH_FAILURE,
  AZURE_STORAGE_MOUNT_FETCH_REQUEST,
  AZURE_STORAGE_MOUNT_FETCH_SUCCESS,
  AZURE_STORAGE_MOUNT_UPDATE_FAILURE,
  AZURE_STORAGE_MOUNT_UPDATE_REQUEST,
  AZURE_STORAGE_MOUNT_UPDATE_SUCCESS,
  UPDATE_AZURE_STORAGE_MOUNT_FROM_SITE_UPDATE,
} from './actionTypes';
import { ArmAzureStorageMount } from './reducer';

export const fetchAzureStorageMountRequest = createStandardAction(AZURE_STORAGE_MOUNT_FETCH_REQUEST)();

export const fetchAzureStorageMountSuccess = createStandardAction(AZURE_STORAGE_MOUNT_FETCH_SUCCESS).map(
  (azureMount: ArmObj<ArmAzureStorageMount>) => ({
    azureMount,
  })
);
export const fetchAzureStorageMountFailure = createStandardAction(AZURE_STORAGE_MOUNT_FETCH_FAILURE).map((error: Error) => ({
  error,
}));

export const updateAzureStorageMountRequest = createStandardAction(AZURE_STORAGE_MOUNT_UPDATE_REQUEST).map(
  (azureMount: ArmObj<ArmAzureStorageMount>) => ({
    azureMount,
  })
);

export const updateAzureStorageMountSuccess = createStandardAction(AZURE_STORAGE_MOUNT_UPDATE_SUCCESS).map(
  (azureMount: ArmObj<ArmAzureStorageMount>) => ({
    azureMount,
  })
);

export const updateAzureStorageMountFailure = createStandardAction(AZURE_STORAGE_MOUNT_UPDATE_FAILURE).map((error: Error) => ({
  error,
}));

export const updateAzureStorageMountFromSiteUpdate = createStandardAction(UPDATE_AZURE_STORAGE_MOUNT_FROM_SITE_UPDATE).map(
  (site: ArmObj<Site>) => {
    const azureStorageMount = !!site.properties && !!site.properties.siteConfig && site.properties.siteConfig.azureStorageAccounts;
    return { azureStorageMount };
  }
);
