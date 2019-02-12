import { createContext } from 'react';
import { ArmArray, StorageAccount, Site } from '../../../models/WebAppModels';
import { AvailableStack } from '../../../models/available-stacks';
import { Permissions } from './AppSettings.types';

export const AvailableStacksContext = createContext<ArmArray<AvailableStack>>({ value: [] });

export const PermissionsContext = createContext<Permissions>({
  production_write: true,
  app_write: true,
  editable: true,
});

export const StorageAccountsContext = createContext<ArmArray<StorageAccount>>({ value: [] });
export const SlotsListContext = createContext<ArmArray<Site>>({ value: [] });
