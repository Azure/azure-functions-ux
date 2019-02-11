import { FormikActions } from 'formik';
import React, { useState, useEffect, useContext } from 'react';
import { AppSettingsFormValues } from './AppSettings.types';
import { convertStateToForm, convertFormToState } from './AppSettingsFormData';
import LoadingComponent from '../../../components/loading/loading-component';
import { fetchApplicationSettingValues, updateSite, updateWebConfig, updateSlotConfigNames, fetchSlots } from './AppSettings.service';
import { ArmArray, ArmObj, SlotConfigNames, StorageAccount, Site } from '../../../models/WebAppModels';
import { AvailableStack } from '../../../models/available-stacks';
import { AvailableStacksContext, PermissionsContext, StorageAccountsContext, SlotsListContext } from './Contexts';
import { PortalContext } from '../../../PortalContext';
import { useTranslation } from 'react-i18next';
import { HttpResponseObject } from '../../../ArmHelper.types';
export interface AppSettingsDataLoaderProps {
  children: (
    props: {
      initialFormValues: AppSettingsFormValues;
      saving: boolean;
      onSubmit: (values: AppSettingsFormValues, actions: FormikActions<AppSettingsFormValues>) => void;
    }
  ) => JSX.Element;
  resourceId: string;
}

const AppSettingsDataLoader: React.FC<AppSettingsDataLoaderProps> = props => {
  const { resourceId, children } = props;
  const [initialValues, setInitialValues] = useState<AppSettingsFormValues | null>(null);
  const [initialLoading, setInitialLoading] = useState(false);
  const [currentAvailableStacks, setCurrentAvailableStacks] = useState<ArmArray<AvailableStack>>({ value: [] });
  const [appPermissions, setAppPermissions] = useState<boolean>(true);
  const [productionPermissions, setProductionPermissions] = useState<boolean>(true);
  const [metadataFromApi, setMetadataFromApi] = useState<ArmObj<{ [key: string]: string }>>({ name: '', id: '', properties: {} });
  const [slotConfigNamesFromApi, setSlotConfigNamesFromApi] = useState<ArmObj<SlotConfigNames>>({
    name: '',
    id: '',
    properties: { appSettingNames: [], azureStorageConfigNames: [], connectionStringNames: [] },
  });
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

    if (applicationSettings.metadata.status === 403) {
      setAppPermissions(false);
      if (!resourceId.includes('/slots/')) {
        setProductionPermissions(false);
      }
    } else {
      setMetadataFromApi(metadata.data);
      setSlotConfigNamesFromApi(slotConfigNames.data);
    }

    setStorageAccountsState(storageAccounts.data);
    setInitialValues(
      convertStateToForm({
        site: site.data,
        config: webConfig.data,
        metadata: metadata.metadata.success ? metadata.data : undefined,
        connectionStrings: connectionStrings.metadata.success ? connectionStrings.data : undefined,
        appSettings: applicationSettings.metadata.success ? applicationSettings.data : undefined,
        slotConfigNames: slotConfigNames.data,
        siteWritePermission: true,
        productionWritePermission: true,
        azureStorageMounts: azureStorageMounts.metadata.success ? azureStorageMounts.data : undefined,
      })
    );
    if (site.data.kind!.includes('linux')) {
      setCurrentAvailableStacks(linuxStacks.data);
    } else {
      setCurrentAvailableStacks(windowsStacks.data);
    }

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

  const onSubmit = async (values: AppSettingsFormValues, actions: FormikActions<AppSettingsFormValues>) => {
    const { site, config, slotConfigNames } = convertFormToState(values, metadataFromApi, slotConfigNamesFromApi);
    const notificationId = portalContext.startNotification(t('configUpdating'), t('configUpdating'));
    const siteUpdate = updateSite(resourceId, site);
    const configUpdate = updateWebConfig(resourceId, config);
    let slotConfigUpdates: Promise<HttpResponseObject<unknown>> | undefined;
    if (productionPermissions) {
      slotConfigUpdates = updateSlotConfigNames(resourceId, slotConfigNames);
    }
    const [siteResult, configResult] = await Promise.all([siteUpdate, configUpdate]);
    const slotConfigResults = !!slotConfigUpdates
      ? await slotConfigUpdates
      : {
          metadata: {
            success: true,
          },
        };
    if (siteResult.metadata.success && configResult.metadata.success && slotConfigResults.metadata.success) {
      setInitialValues(values);
      portalContext.stopNotification(notificationId, true, t('configUpdateSuccess'));
    } else {
      portalContext.stopNotification(notificationId, false, t('configUpdateFailure'));
    }
  };
  if (!initialLoading || !initialValues) {
    return <LoadingComponent pastDelay={true} error={false} isLoading={true} timedOut={false} retry={() => null} />;
  }
  return (
    <AvailableStacksContext.Provider value={currentAvailableStacks}>
      <PermissionsContext.Provider value={{ app_write: appPermissions, production_write: productionPermissions }}>
        <StorageAccountsContext.Provider value={storageAccountsState}>
          <SlotsListContext.Provider value={slotList}>
            {children({ onSubmit, initialFormValues: initialValues, saving: false })}
          </SlotsListContext.Provider>
        </StorageAccountsContext.Provider>
      </PermissionsContext.Provider>
    </AvailableStacksContext.Provider>
  );
};

export default AppSettingsDataLoader;
