import { FormikActions } from 'formik';
import React, { useEffect, useContext, useState } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { bindActionCreators, Dispatch } from 'redux';

import { fetchStacksRequest, StacksOS } from '../../../modules/service/available-stacks/actions';
import { fetchPermissions, PermissionCheckObj, fetchReadonlyLocks, ReadonlyCheckObj } from '../../../modules/service/rbac/thunks';
import { fetchSiteRequest, updateSiteRequest } from '../../../modules/site/actions';
import { fetchAppSettingsRequest } from '../../../modules/site/config/appsettings/actions';
import { AppSettingsState } from '../../../modules/site/config/appsettings/reducer';
import { fetchConnectionStringsRequest } from '../../../modules/site/config/connectionstrings/actions';
import { ConnectionStringState } from '../../../modules/site/config/connectionstrings/reducer';
import { fetchMetadataRequest } from '../../../modules/site/config/metadata/actions';
import { MetadataState } from '../../../modules/site/config/metadata/reducer';
import { fetchSlotConfigRequest, updateSlotConfigRequest } from '../../../modules/site/config/slotConfigNames/actions';
import { SlotConfigNamesState } from '../../../modules/site/config/slotConfigNames/reducer';
import { fetchWebConfigRequest, updateWebConfigRequest } from '../../../modules/site/config/web/actions';
import { ConfigStateType } from '../../../modules/site/config/web/reducer';
import { SiteState } from '../../../modules/site/reducer';
import { RootAction, RootState } from '../../../modules/types';
import { AppSettingsFormValues } from './AppSettings.types';
import { convertStateToForm, convertFormToState } from './AppSettingsFormData';
import { ArmObj, Site, SiteConfig, SlotConfigNames } from '../../../models/WebAppModels';
import { PortalContext } from '../../../PortalContext';
import { translate, InjectedTranslateProps } from 'react-i18next';
import LoadingComponent from '../../../components/loading/loading-component';
import { AxiosError } from 'axios';
import LogService from '../../../utils/LogService';
import { fetchAzureStorageMountRequest } from '../../../modules/site/config/azureStorageAccounts/actions';
import { AzureStorageMountState } from '../../../modules/site/config/azureStorageAccounts/reducer';
import { fetchStorageAccountsRequest } from '../../../modules/storageAccounts/actions';
export interface AppSettingsDataLoaderProps {
  children: (
    props: {
      initialFormValues: AppSettingsFormValues;
      saving: boolean;
      loading: boolean;
      onSubmit: (values: AppSettingsFormValues, actions: FormikActions<AppSettingsFormValues>) => void;
    }
  ) => JSX.Element;
  fetchSite: () => void;
  fetchStacks: (osType: StacksOS) => void;
  fetchAppSettings: () => void;
  fetchConfig: () => void;
  fetchMetadata: () => void;
  fetchSlotConfigNames: () => void;
  fetchAzureStorageMounts: () => void;
  fetchConnectionStrings: () => void;
  fetchPermissions: (resources: PermissionCheckObj[]) => void;
  fetchReadonly: (resources: ReadonlyCheckObj[]) => void;
  updateSite: (site: ArmObj<Site>) => void;
  updateConfig: (config: ArmObj<SiteConfig>) => void;
  updateSlotConfig: (slotNames: ArmObj<SlotConfigNames>) => void;
  fetchAzureStorageAccounts: () => void;
  resourceId: string;
  site: SiteState;
  config: ConfigStateType;
  appSettings: AppSettingsState;
  azureStorageMounts: AzureStorageMountState;
  connectionStrings: ConnectionStringState;
  metadata: MetadataState;
  slotConfigNames: SlotConfigNamesState;
  siteWritePermission: boolean;
  productionWritePermission: boolean;
  permissionsWaiting: string[];
  readonlyWaiting: string[];
}

// `state` parameter needs a type annotation to type-check the correct shape of a state object but also it'll be used by "type inference" to infer the type of returned props
const isLoading = (props: AppSettingsDataLoaderProps) => {
  const {
    site,
    config,
    appSettings,
    metadata,
    connectionStrings,
    slotConfigNames,
    permissionsWaiting,
    resourceId,
    readonlyWaiting,
  } = props;

  return (
    site.metadata.loading ||
    config.metadata.loading ||
    appSettings.metadata.loading ||
    metadata.metadata.loading ||
    connectionStrings.metadata.loading ||
    slotConfigNames.metadata.loading ||
    permissionsWaiting.includes(resourceId) ||
    readonlyWaiting.includes(resourceId)
  );
};

const isUpdating = (props: AppSettingsDataLoaderProps) => {
  const { site, config, appSettings, metadata, connectionStrings, slotConfigNames } = props;
  return (
    site.metadata.updating ||
    config.metadata.updating ||
    appSettings.metadata.updating ||
    metadata.metadata.updating ||
    connectionStrings.metadata.updating ||
    slotConfigNames.metadata.updating
  );
};

const updateError = (props: AppSettingsDataLoaderProps) => {
  const { site, config, slotConfigNames } = props;
  return (
    (site.metadata.updateError && site.metadata.updateErrorObject) ||
    (config.metadata.updateError && config.metadata.updateErrorObject) ||
    (slotConfigNames.metadata.updateError && slotConfigNames.metadata.updateErrorObject)
  );
};

const getProductionId = (resourceId: string) => resourceId.split('/slots/')[0];
const AppSettingsDataLoader: React.SFC<AppSettingsDataLoaderProps & InjectedTranslateProps> = props => {
  const {
    fetchAppSettings,
    fetchConfig,
    fetchConnectionStrings,
    fetchSite,
    fetchPermissions,
    fetchMetadata,
    fetchSlotConfigNames,
    fetchAzureStorageAccounts,
    resourceId,
    fetchStacks,
    metadata,
    slotConfigNames,
    updateConfig,
    updateSite,
    updateSlotConfig,
    productionWritePermission,
    fetchReadonly,
    fetchAzureStorageMounts,
    azureStorageMounts,
    t,
  } = props;

  const [baseValues, setBaseValues] = useState(convertStateToForm(props));
  const onSubmit = async (values: AppSettingsFormValues, actions: FormikActions<AppSettingsFormValues>) => {
    const newValues = convertFormToState(values, metadata.data, slotConfigNames.data);
    updateSite(newValues.site);
    updateConfig(newValues.config);

    newValues.slotConfigNames && productionWritePermission && updateSlotConfig(newValues.slotConfigNames);
    setNotificationId(portalContext.startNotification(t('configUpdating'), t('configUpdating')));
    setBaseValues(values);
  };

  const portalContext = useContext(PortalContext);
  const [notificationId, setNotificationId] = useState('');
  const [loggedStop, setLoggedStop] = useState(false);
  const loadingOrUpdating = isUpdating(props) || isLoading(props);

  const [initialLoading, setInitialLoading] = useState(true);
  useEffect(
    () => {
      const { kind } = props.site.data;

      if (kind) {
        let os: StacksOS = 'Windows';
        if (kind.includes('linux')) {
          os = 'Linux';
        }
        fetchStacks(os);
        if (kind.includes('container') || kind.includes('linux')) {
          fetchAzureStorageMounts();
        }
      }
    },
    [props.site.data.kind]
  );

  useEffect(
    () => {
      setBaseValues(convertStateToForm(props));
    },
    [azureStorageMounts]
  );
  useEffect(
    () => {
      if (!loadingOrUpdating) {
        setInitialLoading(false);
        setBaseValues(convertStateToForm(props));
      }

      if (!loadingOrUpdating && notificationId) {
        const err = updateError(props) as AxiosError | Error;
        if (err) {
          let eMessage = '';
          if ('response' in err) {
            eMessage = err.response && err.response.data && err.response.data.Message;
          } else {
            eMessage = err.message;
          }
          portalContext.stopNotification(notificationId, false, `${t('configUpdateFailure')} ${eMessage}`);
        } else {
          portalContext.stopNotification(notificationId, true, t('configUpdateSuccess'));
        }
        setNotificationId('');
      }
    },
    [loadingOrUpdating]
  );

  useEffect(() => {
    fetchConfig();
    fetchSite();
    fetchSlotConfigNames();
    fetchMetadata();
    fetchConnectionStrings();
    fetchAppSettings();
    fetchPermissions([{ resourceId, action: './write' }]);
    fetchReadonly([{ resourceId }]);
    fetchAzureStorageAccounts();
    if (resourceId.includes('/slots/')) {
      const productionId = getProductionId(resourceId);
      fetchPermissions([{ resourceId: productionId, action: './write' }]);
      fetchReadonly([{ resourceId: productionId }]);
    }
    setInitialLoading(true);
  }, []);
  if (initialLoading) {
    return <LoadingComponent pastDelay={true} error={false} isLoading={true} timedOut={false} retry={() => null} />;
  }
  if (!loggedStop) {
    LogService.stopTrackPage('shell', { feature: 'AppSettings' });
    setLoggedStop(true);
  }

  console.log(baseValues);
  return <>{props.children({ onSubmit, initialFormValues: baseValues, saving: isUpdating(props), loading: isLoading(props) })}</>;
};

const mapStateToProps = (state: RootState) => {
  const siteWriteKey = `${state.site.resourceId}|./write`;
  let parentWriteKey = '';
  let parentResourceId = '';
  if (state.site.resourceId.includes('/slots/')) {
    parentResourceId = getProductionId(state.site.resourceId);
    parentWriteKey = `${parentResourceId}|./write`;
  }
  const siteWritePermission = state.rbac.permissions[siteWriteKey] && !state.rbac.readonlyLocks[state.site.resourceId];
  const productionWritePermission = parentWriteKey
    ? state.rbac.permissions[parentWriteKey] && !state.rbac.readonlyLocks[parentResourceId]
    : state.rbac.permissions[siteWriteKey] && !state.rbac.readonlyLocks[state.site.resourceId];
  return {
    siteWritePermission,
    productionWritePermission,
    resourceId: state.site.resourceId,
    site: state.site,
    config: state.webConfig,
    appSettings: state.appSettings,
    connectionStrings: state.connectionStrings,
    metadata: state.metadata,
    slotConfigNames: state.slotConfigNames,
    permissionsWaiting: state.rbac.permissionCalled,
    readonlyWaiting: state.rbac.readonlyLockCalled,
    azureStorageMounts: state.azureStorageMount,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      fetchSite: fetchSiteRequest,
      fetchAppSettings: fetchAppSettingsRequest,
      fetchConnectionStrings: fetchConnectionStringsRequest,
      fetchConfig: fetchWebConfigRequest,
      fetchStacks: fetchStacksRequest,
      fetchMetadata: fetchMetadataRequest,
      fetchSlotConfigNames: fetchSlotConfigRequest,
      fetchPermissions: fetchPermissions,
      updateSite: updateSiteRequest,
      updateConfig: updateWebConfigRequest,
      updateSlotConfig: updateSlotConfigRequest,
      fetchReadonly: fetchReadonlyLocks,
      fetchAzureStorageMounts: fetchAzureStorageMountRequest,
      fetchAzureStorageAccounts: fetchStorageAccountsRequest,
    },
    dispatch
  );

export default compose(
  translate('translation'),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(AppSettingsDataLoader);
