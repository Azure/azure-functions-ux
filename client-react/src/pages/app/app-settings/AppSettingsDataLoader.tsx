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
import { ArmArray, ArmObj, SlotConfigNames, StorageAccount, Site } from '../../../models/WebAppModels';
import { AvailableStack } from '../../../models/available-stacks';
import { AvailableStacksContext, PermissionsContext, StorageAccountsContext, SlotsListContext, SiteContext } from './Contexts';
import { PortalContext } from '../../../PortalContext';
import { useTranslation } from 'react-i18next';
import { HttpResponseObject } from '../../../ArmHelper.types';
import SiteService from '../../../ApiHelpers/SiteService';
import LogService from '../../../utils/LogService';

export interface AppSettingsDataLoaderProps {
  children: (props: {
    initialFormValues: AppSettingsFormValues;
    saving: boolean;
    scaleUpPlan: () => void;
    onSubmit: (values: AppSettingsFormValues, actions: FormikActions<AppSettingsFormValues>) => void;
  }) => JSX.Element;
  resourceId: string;
}

const AppSettingsDataLoader: React.FC<AppSettingsDataLoaderProps> = props => {
  const { resourceId, children } = props;
  const [initialValues, setInitialValues] = useState<AppSettingsFormValues | null>(null);
  const [initialLoading, setInitialLoading] = useState(false);
  const [currentAvailableStacks, setCurrentAvailableStacks] = useState<ArmArray<AvailableStack>>({ value: [] });
  const [appPermissions, setAppPermissions] = useState<boolean>(true);
  const [productionPermissions, setProductionPermissions] = useState<boolean>(true);
  const [editable, setEditable] = useState<boolean>(true);
  const portalCommunicator = useContext(PortalContext);
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
    setCurrentSiteNonForm(site.data);
    if (
      applicationSettings.metadata.status === 403 || // failing RBAC permissions
      applicationSettings.metadata.status === 409 // Readonly locked
    ) {
      setAppPermissions(false);
      if (!resourceId.includes('/slots/')) {
        setProductionPermissions(false);
      } else {
        const productionPermission = await getProductionAppWritePermissions(resourceId);
        setProductionPermissions(productionPermission);
      }
    } else {
      setMetadataFromApi(metadata.data);
      setSlotConfigNamesFromApi(slotConfigNames.data);
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
    LogService.stopTrackPage('shell', { feature: 'AppSettings' });
    portalCommunicator.loadComplete();
    setInitialLoading(true);
  };
  const fillSlots = async () => {
    const slots = await fetchSlots(resourceId);
    if (slots.metadata.success) {
      setSlotList(slots.data);
    }
  };
  useEffect(() => {
    fetchData();
    fillSlots();
  }, []);
  const scaleUpPlan = async () => {
    await portalCommunicator.openBlade(
      { detailBlade: 'SpecPickerFrameBlade', detailBladeInputs: { id: currentSiteNonForm.properties.serverFarmId } },
      'appsettings'
    );
    const newSite = await SiteService.fetchSite(resourceId);
    setCurrentSiteNonForm(newSite.data);
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
  if (!initialLoading || !initialValues) {
    return <LoadingComponent />;
  }
  return (
    <AvailableStacksContext.Provider value={currentAvailableStacks}>
      <PermissionsContext.Provider value={{ editable, app_write: appPermissions, production_write: productionPermissions }}>
        <StorageAccountsContext.Provider value={storageAccountsState}>
          <SiteContext.Provider value={currentSiteNonForm}>
            <SlotsListContext.Provider value={slotList}>
              {children({ onSubmit, scaleUpPlan, initialFormValues: initialValues, saving: false })}
            </SlotsListContext.Provider>
          </SiteContext.Provider>
        </StorageAccountsContext.Provider>
      </PermissionsContext.Provider>
    </AvailableStacksContext.Provider>
  );
};

export default AppSettingsDataLoader;
