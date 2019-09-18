import { FormikActions } from 'formik';
import React, { useState, useEffect, useContext } from 'react';
import { AppSettingsFormValues } from './AppSettings.types';
import { convertStateToForm, convertFormToState, flattenVirtualApplicationsList, getCleanedConfigForSave } from './AppSettingsFormData';
import LoadingComponent from '../../../components/loading/loading-component';
import {
  fetchApplicationSettingValues,
  fetchSlots,
  updateSite,
  updateWebConfig,
  updateSlotConfigNames,
  getProductionAppWritePermissions,
  updateStorageMounts,
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

export interface AppSettingsDataLoaderProps {
  children: (props: {
    initialFormValues: AppSettingsFormValues | null;
    saving: boolean;
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
  const portalContext = useContext(PortalContext);
  const { t } = useTranslation();

  const fetchData = async () => {
    const {
      site,
      webConfig,
      metadata,
      connectionStrings,
      applicationSettings,
      slotConfigNames,
      storageAccounts,
      azureStorageMounts,
      windowsStacks,
      linuxStacks,
    } = await fetchApplicationSettingValues(resourceId);

    const loadingFailed =
      !site.metadata.success ||
      !webConfig.metadata.success ||
      (!metadata.metadata.success && metadata.metadata.status !== 403 && metadata.metadata.status !== 409) ||
      (!connectionStrings.metadata.success && connectionStrings.metadata.status !== 403 && connectionStrings.metadata.status !== 409) ||
      (!applicationSettings.metadata.success &&
        applicationSettings.metadata.status !== 403 &&
        applicationSettings.metadata.status !== 409) ||
      !slotConfigNames.metadata.success ||
      !storageAccounts.metadata.success ||
      (!azureStorageMounts.metadata.success && azureStorageMounts.metadata.status !== 403 && azureStorageMounts.metadata.status !== 409) ||
      !windowsStacks.metadata.success ||
      !linuxStacks.metadata.success;

    setLoadingFailure(loadingFailed);

    if (!loadingFailed) {
      setCurrentSiteNonForm(site.data);
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
        setSlotConfigNamesFromApi(slotConfigNames.data);
      }

      if (resourceId.includes('/slots/')) {
        const productionPermission = await getProductionAppWritePermissions(portalContext, resourceId);
        setProductionPermissions(productionPermission);
      }

      if (site.data.properties.targetSwapSlot) {
        setEditable(false);
      }
      setStorageAccountsState(storageAccounts.data);
      setInitialValues(
        convertStateToForm({
          site: site.data,
          config: webConfig.data,
          metadata: metadata.metadata.success ? metadata.data : null,
          connectionStrings: connectionStrings.metadata.success ? connectionStrings.data : null,
          appSettings: applicationSettings.metadata.success ? applicationSettings.data : null,
          slotConfigNames: slotConfigNames.data,
          azureStorageMounts: azureStorageMounts.metadata.success ? azureStorageMounts.data : null,
        })
      );
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

  const loadData = () => {
    fetchData();
    fillSlots();
  };

  useEffect(() => {
    loadData();
  }, []);

  const scaleUpPlan = async () => {
    await portalContext.openBlade(
      { detailBlade: 'SpecPickerFrameBlade', detailBladeInputs: { id: currentSiteNonForm.properties.serverFarmId } },
      'appsettings'
    );
    const newSite = await SiteService.fetchSite(resourceId);
    setCurrentSiteNonForm(newSite.data);
  };

  const refreshAppSettings = () => {
    setRefreshValues(true);
    setLoadingFailure(false);
    loadData();
  };

  const onSubmit = async (values: AppSettingsFormValues, actions: FormikActions<AppSettingsFormValues>) => {
    const { site, config, slotConfigNames, storageMounts } = convertFormToState(values, metadataFromApi, slotConfigNamesFromApi);
    const notificationId = portalContext.startNotification(t('configUpdating'), t('configUpdating'));
    const siteUpdate = updateSite(resourceId, site);
    const configUpdate = updateWebConfig(resourceId, getCleanedConfigForSave(config));
    let slotConfigUpdates: Promise<HttpResponseObject<unknown>> | undefined;
    if (productionPermissions) {
      slotConfigUpdates = updateSlotConfigNames(resourceId, slotConfigNames);
    }
    const storageUpdateCall = updateStorageMounts(resourceId, storageMounts);
    const [siteResult, configResult] = await Promise.all([siteUpdate, configUpdate, storageUpdateCall]);
    const slotConfigResults = !!slotConfigUpdates
      ? await slotConfigUpdates
      : {
          metadata: {
            success: true,
            error: null,
          },
        };

    if (siteResult.metadata.success && configResult.metadata.success && slotConfigResults.metadata.success) {
      setInitialValues({
        ...values,
        virtualApplications: flattenVirtualApplicationsList(configResult.data.properties.virtualApplications),
      });
      portalContext.stopNotification(notificationId, true, t('configUpdateSuccess'));
    } else {
      const siteError = siteResult.metadata.error && siteResult.metadata.error.Message;
      const configError = configResult.metadata.error && configResult.metadata.error.Message;
      const slotConfigError = slotConfigResults.metadata.error && slotConfigResults.metadata.error.Message;
      const errMessage = siteError || configError || slotConfigError || t('configUpdateFailure');
      portalContext.stopNotification(notificationId, false, errMessage);
    }
  };

  if (!initialLoading || refreshValues || (!initialValues && !loadingFailure)) {
    return <LoadingComponent />;
  }

  return (
    <AvailableStacksContext.Provider value={currentAvailableStacks}>
      <PermissionsContext.Provider value={{ editable, app_write: appPermissions, production_write: productionPermissions }}>
        <StorageAccountsContext.Provider value={storageAccountsState}>
          <SiteContext.Provider value={currentSiteNonForm}>
            <SlotsListContext.Provider value={slotList}>
              {children({ onSubmit, scaleUpPlan, refreshAppSettings, initialFormValues: initialValues, saving: false })}
            </SlotsListContext.Provider>
          </SiteContext.Provider>
        </StorageAccountsContext.Provider>
      </PermissionsContext.Provider>
    </AvailableStacksContext.Provider>
  );
};

export default AppSettingsDataLoader;
