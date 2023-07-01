import { createContext } from 'react';

import { ArmArray, ArmObj } from '../../../models/arm-obj';
import { Site } from '../../../models/site/site';
import { FunctionAppStack } from '../../../models/stacks/function-app-stacks';
import { WebAppStack } from '../../../models/stacks/web-app-stacks';
import { StorageAccount } from '../../../models/storage-account';

import { Permissions } from './AppSettings.types';

export const WebAppStacksContext = createContext<WebAppStack[]>([]);
export const FunctionAppStacksContext = createContext<FunctionAppStack[]>([]);

export const PermissionsContext = createContext<Permissions>({
  production_write: true,
  app_write: true,
  editable: true,
  saving: false,
});

export const StorageAccountsContext = createContext<ArmArray<StorageAccount>>({ value: [] });
export const SlotsListContext = createContext<ArmArray<Site>>({ value: [] });
export const SiteContext = createContext<ArmObj<Site>>({} as any);
