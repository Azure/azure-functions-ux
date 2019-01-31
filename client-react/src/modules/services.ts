import stacksApi from './service/available-stacks/availableStacksApiService';
import billingMetersApi from './service/billing/billingMetersApiService';
import appSettingsApi from './site/config/appsettings/appSettingsApiService';
import connectionStringsApi from './site/config/connectionstrings/connectionStringsApiService';
import metadataApi from './site/config/metadata/metadataApiService';
import slotConfigNamesApi from './site/config/slotConfigNames/slotConfigNamesService';
import webConfigApi from './site/config/web/webConfigApiService';
import siteApi from './site/siteApiService';
import slotsApi from './site/slots/slotsApiService';
import rbacHelper from '../utils/rbac-helper';
import azureMountApi from './site/config/azureStorageAccounts/azureStorageAccountsApiService';
import storageAccountsApi from './storageAccounts/storageAccountApiService';

const services = {
  siteApi,
  slotsApi,
  webConfigApi,
  slotConfigNamesApi,
  metadataApi,
  connectionStringsApi,
  appSettingsApi,
  stacksApi,
  billingMetersApi,
  rbacHelper,
  azureMountApi,
  storageAccountsApi,
};
export default services;
