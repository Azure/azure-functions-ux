import { FormikActions } from 'formik';
import React, { useState, useEffect, useContext } from 'react';
import { AppSettingsFormValues, AppSettingsReferences, AppSettingsAsyncData, LoadingStates } from './AppSettings.types';
import { convertStateToForm, convertFormToState, getCleanedReferences, getFormAzureStorageMount } from './AppSettingsFormData';
import LoadingComponent from '../../../components/Loading/LoadingComponent';
import {
  fetchApplicationSettingValues,
  fetchSlots,
  updateSite,
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
import { isFunctionApp } from '../../../utils/arm-utils';
import { StartupInfoContext } from '../../../StartupInfoContext';
import { LogCategories } from '../../../utils/LogCategories';
import { KeyValue } from '../../../models/portal-models';
import { getErrorMessage, getErrorMessageOrStringify } from '../../../ApiHelpers/ArmHelper';

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

const delay = async (func: () => Promise<any>, ms: number = 3000) => {
  const sleepPromise = new Promise(resolve => setTimeout(resolve, ms));
  return await sleepPromise.then(func);
};

const executeWithRetries = async (sendRequst: () => Promise<HttpResponseObject<any>>, maxRetries: number) => {
  let remainingAttempts = (maxRetries || 0) + 1;
  let result: HttpResponseObject<any> = await sendRequst();

  while (remainingAttempts) {
    if (result.metadata.status === 200) {
      return result;
    }

    remainingAttempts = remainingAttempts - 1;

    result = await delay(() => sendRequst());
  }

  return result;
};

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
  const [metadataFromApi, setMetadataFromApi] = useState<ArmObj<KeyValue<string>>>({
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
  const startUpInfoContext = useContext(StartupInfoContext);

  const [asyncData, setAsyncData] = useState<AppSettingsAsyncData>({
    functionsHostStatus: { loadingState: LoadingStates.loading },
    functionsCount: { loadingState: LoadingStates.loading },
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

    // The user may have VNET security restrictions enabled. If so, then including "ipSecurityRestrictions" or "scmIpSecurityRestrictions" in the payload for
    // the config/web API means that the call will require joinViaServiceEndpoint/action permissions on the given subnet(s) referenced in the security restrictions.
    // If the user doesn't have these permissions, the config/web API call will fail. (This is true even if these properties are just being round-tripped.)
    // Since this UI doesn't allow modifying these properties, we can just remove them from the config object to avoid the unnecessary permissions requirement.
    if (webConfig.data) {
      delete webConfig.data.properties.ipSecurityRestrictions;
      delete webConfig.data.properties.scmIpSecurityRestrictions;
    }

    if (!loadingFailed) {
      setCurrentSiteNonForm(site.data);

      if (isFunctionApp(site.data)) {
        SiteService.fireSyncTrigger(site.data, startUpInfoContext.token || '').then(r => {
          if (!r.metadata.success) {
            LogService.error(
              LogCategories.appSettings,
              'fireSyncTrigger',
              `Failed to fire syncTrigger: ${getErrorMessageOrStringify(r.metadata.error)}`
            );
          }
          fetchAsyncData();
        });
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
    const appSettingReferences = await getAllAppSettingReferences(resourceId);
    setReferences({ appSettings: appSettingReferences.metadata.success ? getCleanedReferences(appSettingReferences.data) : null });
  };

  const fetchStorageAccounts = async () => {
    const storageAccounts = await fetchAzureStorageAccounts(resourceId);
    if (storageAccounts.metadata.success) {
      setStorageAccountsState(storageAccounts.data);
    }
  };

  const fetchFuncHostStatus = async (asyncDataLatest: AppSettingsAsyncData) => {
    // This gets called immediately after saving the site config, so the call may fail because the app is restarting.
    // We retry on failure to account for this. We limit retries to three to avoid excessive attempts.
    const [force, maxRetries] = [true, 3];
    const functionsHostStatusPromise = await executeWithRetries(() => fetchFunctionsHostStatus(resourceId, force), maxRetries);
    const success = functionsHostStatusPromise.metadata.success;
    asyncDataLatest.functionsHostStatus = {
      loadingState: success ? LoadingStates.complete : LoadingStates.failed,
      value: success ? functionsHostStatusPromise.data : undefined,
    };
    setAsyncData({ ...asyncDataLatest });
  };

  const fetchFunctionsCount = async (asyncDataLatest: AppSettingsAsyncData) => {
    // This gets called immediately after saving the site config, so the call may fail because the app is restarting.
    // We retry on failure to account for this. We limit retries to three to avoid excessive attempts.
    const [force, maxRetries] = [true, 3];
    const functionsCountPromise = await executeWithRetries(() => getFunctions(resourceId, force), maxRetries);
    const success = functionsCountPromise.metadata.success;
    asyncDataLatest.functionsCount = {
      loadingState: success ? LoadingStates.complete : LoadingStates.failed,
      value: success ? functionsCountPromise.data.value.length : undefined,
    };
    setAsyncData({ ...asyncDataLatest });
  };

  const fetchAsyncData = () => {
    const asyncDataLatest: AppSettingsAsyncData = {
      functionsHostStatus: { loadingState: LoadingStates.loading },
      functionsCount: { loadingState: LoadingStates.loading },
    };
    setAsyncData({ ...asyncDataLatest });
    fetchFuncHostStatus(asyncDataLatest);
    fetchFunctionsCount(asyncDataLatest);
  };

  const loadData = () => {
    fetchData();
    fillSlots();
    fetchReferences();
    fetchStorageAccounts();
  };

  useEffect(() => {
    loadData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const notificationId = portalContext.startNotification(t('configUpdating'), t('configUpdating'));
    const { site, slotConfigNames, storageMounts, slotConfigNamesModified, storageMountsModified } = convertFormToState(
      values,
      metadataFromApi,
      initialValues!,
      slotConfigNamesFromApi
    );

    // TODO (andimarc): Once the API is updated, include azureStorageAccounts on the site config object instead of making a separate call
    // TASK 5843044 - Combine updateSite and updateAzureStorageMount calls into a single PUT call when saving config
    const [siteUpdate, slotConfigNamesUpdate, storageMountsUpdate] = [
      updateSite(resourceId, site),
      productionPermissions && slotConfigNamesModified ? updateSlotConfigNames(resourceId, slotConfigNames) : Promise.resolve(null),
      storageMountsModified ? updateStorageMounts(resourceId, storageMounts) : Promise.resolve(null),
    ];

    const [siteResult, slotConfigNamesResult, storageMountsResult] = await Promise.all([
      siteUpdate,
      slotConfigNamesUpdate,
      storageMountsUpdate,
    ]);

    const success =
      siteResult!.metadata.success &&
      (!slotConfigNamesResult || slotConfigNamesResult.metadata.success) &&
      (!storageMountsResult || storageMountsResult.metadata.success);

    if (success) {
      const azureStorageMounts = storageMountsResult ? getFormAzureStorageMount(storageMountsResult.data) : values.azureStorageMounts;
      setInitialValues({
        ...values,
        azureStorageMounts,
      });
      if (slotConfigNamesResult) {
        setSlotConfigNamesFromApi(slotConfigNamesResult.data);
      }

      fetchReferences();
      if (isFunctionApp(site)) {
        SiteService.fireSyncTrigger(site, startUpInfoContext.token || '').then(r => {
          if (!r.metadata.success) {
            LogService.error(
              LogCategories.appSettings,
              'fireSyncTrigger',
              `Failed to fire syncTrigger: ${getErrorMessageOrStringify(r.metadata.error)}`
            );
          }
          fetchAsyncData();
        });
      }
      portalContext.stopNotification(notificationId, true, t('configUpdateSuccess'));
    } else {
      const [siteError, slotConfigError, storageMountsError] = [
        getErrorMessage(siteResult!.metadata.error),
        getErrorMessage(slotConfigNamesResult && slotConfigNamesResult.metadata.error),
        getErrorMessage(storageMountsResult && storageMountsResult.metadata.error),
      ];
      const errorMessage = siteError || slotConfigError || storageMountsError;
      const message = errorMessage ? t('configUpdateFailureExt').format(errorMessage) : t('configUpdateFailure');
      portalContext.stopNotification(notificationId, false, message);
    }
    setSaving(false);
  };

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
