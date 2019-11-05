import { createContext } from 'react';
import { AvailableStack } from '../../../models/available-stacks';
import { Permissions } from './AppSettings.types';
import { ArmArray, ArmObj } from '../../../models/arm-obj';
import { StorageAccount } from '../../../models/storage-account';
import { Site } from '../../../models/site/site';

export const AvailableStacksContext = createContext<ArmArray<AvailableStack>>({ value: [] });

export const PermissionsContext = createContext<Permissions>({
  production_write: true,
  app_write: true,
  editable: true,
  saving: false,
});

export const StorageAccountsContext = createContext<ArmArray<StorageAccount>>({ value: [] });
export const SlotsListContext = createContext<ArmArray<Site>>({ value: [] });
export const SiteContext = createContext<ArmObj<Site>>({} as any);
