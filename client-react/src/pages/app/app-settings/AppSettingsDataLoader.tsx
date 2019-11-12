import { FormikActions } from 'formik';
import React, { useState, useEffect, useContext } from 'react';
import { AppSettingsFormValues, AppSettingsReferences, AsyncObj, AppSettingsAsyncData } from './AppSettings.types';
import {
  convertStateToForm,
  convertFormToState,
  flattenVirtualApplicationsList,
  getCleanedConfigForSave,
  getCleanedReferences,
} from './AppSettingsFormData';
import LoadingComponent from '../../../components/loading/loading-component';
import {
  fetchApplicationSettingValues,
  fetchSlots,
  updateSite,
  updateWebConfig,
  updateSlotConfigNames,
  getProductionAppWritePermissions,
  updateStorageMounts,
  getAllAppSettingReferences,
  fetchAzureStorageAccounts,
  getFunctions,
  fetchFunctionsHostStatus,
} from './AppSettings.service';
import { AvailableStack } from '../../../models/available-stacks';
import { AvailableStacksContext, PermissionsContext, StorageAccountsContext, SlotsListContext, SiteContext } from './Contexts';
import { PortalContext } from '../../../PortalContext';
import { useTranslation } from 'react-i18next';
import { HttpResponseObject } from '../../../ArmHelper.types';
import SiteService from '../../../ApiHelpers/SiteService';
import LogService from '../../../utils/LogService';
import { ArmArray, ArmObj } from '../../../models/arm-obj';
import { SlotConfigNames } from '../../../models/site/slot-config-names';
import { StorageAccount } from '../../../models/storage-account';
import { Site } from '../../../models/site/site';
import { SiteRouterContext } from '../SiteRouter';
import { ArmSiteDescriptor } from '../../../utils/resourceDescriptors';
import { HostStatus } from '../../../models/functions/host-status';
import { isFunctionApp } from '../../../utils/arm-utils';

export interface AppSettingsDataLoaderProps {
  children: (props: {
    initialFormValues: AppSettingsFormValues | null;
    asyncData: AppSettingsAsyncData;
    scaleUpPlan: () => void;
    refreshAppSettings: () => void;
    onSubmit: (values: AppSettingsFormValues, actions: FormikActions<AppSettingsFormValues>) => void;
  }) => JSX.Element;
  resourceId: string;
}

const AppSettingsDataLoader: React.FC<AppSettingsDataLoaderProps> = props => {
  const { resourceId, children } = props;
  const [initialValues, setInitialValues] = useState<AppSettingsFormValues | null>(null);
  const [initialLoading, setInitialLoading] = useState(false);
  const [loadingFailure, setLoadingFailure] = useState(false);
  const [refreshValues, setRefreshValues] = useState(false);
  const [currentAvailableStacks, setCurrentAvailableStacks] = useState<ArmArray<AvailableStack>>({ value: [] });
  const [appPermissions, setAppPermissions] = useState<boolean>(true);
  const [productionPermissions, setProductionPermissions] = useState<boolean>(true);
  const [editable, setEditable] = useState<boolean>(true);
  const [references, setReferences] = useState<AppSettingsReferences | null>(null);
  const [metadataFromApi, setMetadataFromApi] = useState<ArmObj<{ [key: string]: string }>>({
    name: '',
    id: '',
    location: '',
    properties: {},
  });
  const [slotConfigNamesFromApi, setSlotConfigNamesFromApi] = useState<ArmObj<SlotConfigNames>>({
    name: '',
    id: '',
    location: '',
    properties: { appSettingNames: [], azureStorageConfigNames: [], connectionStringNames: [] },
  });
  const [currentSiteNonForm, setCurrentSiteNonForm] = useState({} as any);
  const [slotList, setSlotList] = useState<ArmArray<Site>>({ value: [] });
  const [storageAccountsState, setStorageAccountsState] = useState<ArmArray<StorageAccount>>({ value: [] });
  const [saving, setSaving] = useState(false);
  const portalContext = useContext(PortalContext);
  const { t } = useTranslation();
  const siteContext = useContext(SiteRouterContext);

  const [functionsHostStatus, setFunctionsHostStatus] = useState<AsyncObj<ArmObj<HostStatus>> | undefined>(undefined);
  const [functionsCount, setFunctionsCount] = useState<AsyncObj<number> | undefined>(undefined);
  const [asyncData, setAsyncData] = useState<AppSettingsAsyncData>({
    functionsHostStatus: { loadingState: 'loading' },
    functionsCount: { loadingState: 'loading' },
  });

  const armCallFailed = (response: HttpResponseObject<any>, ignoreRbacAndLocks?: boolean) => {
    if (response.metadata.success) {
      return false;
    }
    return ignoreRbacAndLocks ? response.metadata.status !== 403 && response.metadata.status !== 409 : true;
  };

  const fetchData = async () => {
    const [
      site,
      { webConfig, metadata, connectionStrings, applicationSettings, slotConfigNames, azureStorageMounts, windowsStacks, linuxStacks },
    ] = await Promise.all([siteContext.fetchSite(resourceId), fetchApplicationSettingValues(resourceId)]);

    const loadingFailed =
      armCallFailed(site) ||
      armCallFailed(webConfig) ||
      armCallFailed(metadata, true) ||
      armCallFailed(connectionStrings, true) ||
      armCallFailed(applicationSettings, true) ||
      armCallFailed(azureStorageMounts, true) ||
      armCallFailed(windowsStacks) ||
      armCallFailed(linuxStacks);

    setLoadingFailure(loadingFailed);

    if (!loadingFailed) {
      setCurrentSiteNonForm(site.data);

      if (site.data && isFunctionApp(site.data)) {
        fetchAsyncData();
      }

      if (
        applicationSettings.metadata.status === 403 || // failing RBAC permissions
        applicationSettings.metadata.status === 409 // Readonly locked
      ) {
        setAppPermissions(false);
        if (!resourceId.includes('/slots/')) {
          setProductionPermissions(false);
        }
      } else {
        setMetadataFromApi(metadata.data);
        if (slotConfigNames.metadata.success) {
          setSlotConfigNamesFromApi(slotConfigNames.data);
        }
      }

      if (!slotConfigNames.metadata.success) {
        setProductionPermissions(false);
      } else if (resourceId.includes('/slots/')) {
        const productionPermission = await getProductionAppWritePermissions(portalContext, resourceId);
        setProductionPermissions(productionPermission);
      }

      if (site.data.properties.targetSwapSlot) {
        setEditable(false);
      }

      setInitialValues({
        ...convertStateToForm({
          site: site.data,
          config: webConfig.data,
          metadata: metadata.metadata.success ? metadata.data : null,
          connectionStrings: connectionStrings.metadata.success ? connectionStrings.data : null,
          appSettings: applicationSettings.metadata.success ? applicationSettings.data : null,
          slotConfigNames: slotConfigNames.data,
          azureStorageMounts: azureStorageMounts.metadata.success ? azureStorageMounts.data : null,
        }),
      });

      if (site.data.kind!.includes('linux')) {
        setCurrentAvailableStacks(linuxStacks.data);
      } else {
        setCurrentAvailableStacks(windowsStacks.data);
      }
    }
    LogService.stopTrackPage('shell', { feature: 'AppSettings' });
    portalContext.loadComplete();
    setInitialLoading(true);
    setRefreshValues(false);
  };

  const fillSlots = async () => {
    const slots = await fetchSlots(resourceId);
    if (slots.metadata.success) {
      setSlotList(slots.data);
    }
  };

  const fetchReferences = async () => {
    if (!isSlot()) {
      const appSettingReferences = await getAllAppSettingReferences(resourceId);
      setReferences({ appSettings: appSettingReferences.metadata.success ? getCleanedReferences(appSettingReferences.data) : null });
    }
  };

  const fetchStorageAccounts = async () => {
    const storageAccounts = await fetchAzureStorageAccounts(resourceId);
    if (storageAccounts.metadata.success) {
      setStorageAccountsState(storageAccounts.data);
    }
  };

  const fetchFuncHostStatus = async (shouldRetry?: (hostStatus: ArmObj<HostStatus>) => boolean) => {
    const functionsHostStatusPromise = await fetchFunctionsHostStatus(resourceId, shouldRetry);
    const success = functionsHostStatusPromise.metadata.success;
    setFunctionsHostStatus({
      loadingState: success ? 'complete' : 'failed',
      value: success ? functionsHostStatusPromise.data : undefined,
    });
  };

  const fetchFunctionsCount = async () => {
    const functionsCountPromise = await getFunctions(resourceId);
    const success = functionsCountPromise.metadata.success;
    setFunctionsCount({
      loadingState: success ? 'complete' : 'failed',
      value: success ? functionsCountPromise.data.value.length : 0,
    });
  };

  const fetchAsyncData = (values?: AppSettingsFormValues) => {
    const retryFunctionsHostStatus = (hostStatus: ArmObj<HostStatus>) => {
      if (!values) {
        return true;
      }

      // const currentHostStatus = { ...functionsHostStatus };

      /*
      - prevAppSettingValue
      - newAppSettingValue
      - prevRunningVersion

      let expectedRunningVersion;

      if (newAppSettingValue === '~1') {

      } else if (newAppSettingValue === '~2') {

      } else if (newAppSettingValue === '~3') {

      } else if () {
      } else {

      }

      2.0.12858.0
      const regEx = /[^\d\.\d\.\d\d\d\d\d\.\d]/;
      */
      return true;
    };

    setFunctionsHostStatus(undefined);
    setFunctionsCount(undefined);
    setAsyncData({
      functionsHostStatus: { loadingState: 'loading' },
      functionsCount: { loadingState: 'loading' },
    });
    fetchFuncHostStatus(retryFunctionsHostStatus);
    fetchFunctionsCount();
  };

  const loadData = () => {
    fetchData();
    fillSlots();
    fetchReferences();
    fetchStorageAccounts();
  };

  const isSlot = () => {
    const siteDescriptor = new ArmSiteDescriptor(resourceId);
    return siteDescriptor.slot;
  };

  useEffect(() => {
    loadData();
  }, []);
  const scaleUpPlan = async () => {
    await portalContext.openFrameBlade(
      { detailBlade: 'SpecPickerFrameBlade', detailBladeInputs: { id: currentSiteNonForm.properties.serverFarmId } },
      'appsettings'
    );
    const newSite = await SiteService.fetchSite(resourceId);
    setCurrentSiteNonForm(newSite.data);
  };

  const refreshAppSettings = () => {
    setAppPermissions(true);
    setProductionPermissions(true);
    setEditable(true);
    setRefreshValues(true);
    setLoadingFailure(false);
    loadData();
  };

  const onSubmit = async (values: AppSettingsFormValues, actions: FormikActions<AppSettingsFormValues>) => {
    setSaving(true);
    const { site, config, slotConfigNames, storageMounts } = convertFormToState(values, metadataFromApi, slotConfigNamesFromApi);
    const notificationId = portalContext.startNotification(t('configUpdating'), t('configUpdating'));
    const siteUpdate = updateSite(resourceId, site);
    const configUpdate = updateWebConfig(resourceId, getCleanedConfigForSave(config));
    const slotConfigUpdates = productionPermissions ? updateSlotConfigNames(resourceId, slotConfigNames) : Promise.resolve(null);
    const storageUpdateCall = updateStorageMounts(resourceId, storageMounts);
    const [siteResult, configResult, slotConfigResults] = await Promise.all([
      siteUpdate,
      configUpdate,
      slotConfigUpdates,
      storageUpdateCall,
    ]);

    if (siteResult.metadata.success && configResult.metadata.success && (!slotConfigResults || slotConfigResults.metadata.success)) {
      setInitialValues({
        ...values,
        virtualApplications: flattenVirtualApplicationsList(configResult.data.properties.virtualApplications),
      });
      fetchReferences();
      if (site && isFunctionApp(site)) {
        fetchAsyncData(values);
      }
      portalContext.stopNotification(notificationId, true, t('configUpdateSuccess'));
    } else {
      const siteError = siteResult.metadata.error && siteResult.metadata.error.Message;
      const configError = configResult.metadata.error && configResult.metadata.error.Message;
      const slotConfigError = slotConfigResults && slotConfigResults.metadata.error && slotConfigResults.metadata.error.Message;
      const errMessage = siteError || configError || slotConfigError || t('configUpdateFailure');
      portalContext.stopNotification(notificationId, false, errMessage);
    }
    setSaving(false);
  };

  if (functionsHostStatus || functionsCount) {
    setAsyncData({
      functionsHostStatus: functionsHostStatus === undefined ? asyncData.functionsHostStatus : functionsHostStatus,
      functionsCount: functionsCount === undefined ? asyncData.functionsCount : functionsCount,
    });

    setFunctionsHostStatus(undefined);
    setFunctionsCount(undefined);
  }

  if (!initialLoading || refreshValues || (!initialValues && !loadingFailure)) {
    return <LoadingComponent />;
  }

  if (initialValues && references) {
    setInitialValues({
      ...initialValues,
      references,
    });
    setReferences(null);
  }

  return (
    <AvailableStacksContext.Provider value={currentAvailableStacks}>
      <PermissionsContext.Provider value={{ editable, saving, app_write: appPermissions, production_write: productionPermissions }}>
        <StorageAccountsContext.Provider value={storageAccountsState}>
          <SiteContext.Provider value={currentSiteNonForm}>
            <SlotsListContext.Provider value={slotList}>
              {children({
                onSubmit,
                scaleUpPlan,
                asyncData,
                refreshAppSettings,
                initialFormValues: initialValues,
              })}
            </SlotsListContext.Provider>
          </SiteContext.Provider>
        </StorageAccountsContext.Provider>
      </PermissionsContext.Provider>
    </AvailableStacksContext.Provider>
  );
};

export default AppSettingsDataLoader;
