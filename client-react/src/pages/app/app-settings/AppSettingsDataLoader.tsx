import { FormikActions } from 'formik';
import React, { useState, useEffect, useContext } from 'react';
import {
  AppSettingsFormValues,
  KeyVaultReferences,
  AppSettingsAsyncData,
  LoadingStates,
  FormAzureStorageMounts,
  FormErrorPage,
} from './AppSettings.types';
import { convertStateToForm, convertFormToState, getCleanedReferences } from './AppSettingsFormData';
import LoadingComponent from '../../../components/Loading/LoadingComponent';
import {
  fetchApplicationSettingValues,
  fetchSlots,
  updateSite,
  updateSlotConfigNames,
  getProductionAppWritePermissions,
  getAllAppSettingReferences,
  fetchAzureStorageAccounts,
  getFunctions,
  fetchFunctionsHostStatus,
  getAllConnectionStringsReferences,
  getCustomErrorPagesForSite,
  deleteCustomErrorPageForSite,
} from './AppSettings.service';
import {
  PermissionsContext,
  StorageAccountsContext,
  SlotsListContext,
  SiteContext,
  WebAppStacksContext,
  FunctionAppStacksContext,
} from './Contexts';
import { PortalContext } from '../../../PortalContext';
import { useTranslation } from 'react-i18next';
import { HttpResponseObject } from '../../../ArmHelper.types';
import SiteService from '../../../ApiHelpers/SiteService';
import { ArmArray, ArmObj } from '../../../models/arm-obj';
import { SlotConfigNames } from '../../../models/site/slot-config-names';
import { StorageAccount } from '../../../models/storage-account';
import { Site } from '../../../models/site/site';
import { SiteRouterContext } from '../SiteRouter';
import { isFunctionApp, isKubeApp, isLinuxApp } from '../../../utils/arm-utils';
import { KeyValue } from '../../../models/portal-models';
import { getErrorMessage } from '../../../ApiHelpers/ArmHelper';
import { WebAppStack } from '../../../models/stacks/web-app-stacks';
import RuntimeStackService from '../../../ApiHelpers/RuntimeStackService';
import { AppStackOs } from '../../../models/stacks/app-stacks';
import { FunctionAppStack } from '../../../models/stacks/function-app-stacks';
import { ExperimentationConstants } from '../../../utils/CommonConstants';

export interface AppSettingsDataLoaderProps {
  children: (props: {
    initialFormValues: AppSettingsFormValues | null;
    asyncData: AppSettingsAsyncData;
    scaleUpPlan: () => void;
    refreshAppSettings: () => void;
    onSubmit: (values: AppSettingsFormValues, actions: FormikActions<AppSettingsFormValues>) => void;
    setInitialValues: (initialValues: AppSettingsFormValues | null) => void;
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
  const [webAppStacks, setWebAppStacks] = useState<WebAppStack[]>([]);
  const [functionAppStacks, setFunctionAppStacks] = useState<FunctionAppStack[]>([]);
  const [appPermissions, setAppPermissions] = useState<boolean>(true);
  const [productionPermissions, setProductionPermissions] = useState<boolean>(true);
  const [editable, setEditable] = useState<boolean>(true);
  const [references, setReferences] = useState<KeyVaultReferences | undefined>(undefined);

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

  const [asyncData, setAsyncData] = useState<AppSettingsAsyncData>({
    functionsHostStatus: { loadingState: LoadingStates.loading },
    functionsCount: { loadingState: LoadingStates.loading },
  });

  const [usePatchOnSubmit, setUsePatchOnSubmit] = useState<boolean>();

  const armCallFailed = (response: HttpResponseObject<any>, ignoreRbacAndLocks?: boolean) => {
    if (response.metadata.success) {
      return false;
    }
    return ignoreRbacAndLocks ? response.metadata.status !== 403 && response.metadata.status !== 409 : true;
  };

  const fetchData = async () => {
    const [site, basicPublishingCredentialsPolicies, applicationSettingsResponse, errorPagesResponse] = await Promise.all([
      siteContext.fetchSite(resourceId),
      SiteService.getBasicPublishingCredentialsPolicies(resourceId),
      fetchApplicationSettingValues(resourceId),
      getCustomErrorPagesForSite(resourceId),
    ]);

    const { webConfig, metadata, connectionStrings, applicationSettings, slotConfigNames } = applicationSettingsResponse;

    let loadingFailed =
      armCallFailed(site) ||
      armCallFailed(webConfig) ||
      armCallFailed(metadata, true) ||
      armCallFailed(connectionStrings, true) ||
      armCallFailed(applicationSettings, true);

    let azureStorageMounts;
    const isKube = site.metadata.success && isKubeApp(site.data);

    // NOTE (krmitta): Don't block the entire blade incase siteResponse is returned and the app is not-kube
    if (!isKube) {
      azureStorageMounts = await SiteService.fetchAzureStorageMounts(resourceId);
      loadingFailed = loadingFailed || armCallFailed(azureStorageMounts, true);
    }

    // Get stacks response
    if (!loadingFailed) {
      const isLinux = isLinuxApp(site.data);
      if (isFunctionApp(site.data)) {
        const stacksResponse = await RuntimeStackService.getFunctionAppConfigurationStacks(isLinux ? AppStackOs.linux : AppStackOs.windows);
        if (stacksResponse.metadata.status && !!stacksResponse.data.value) {
          const allFunctionAppStacks: FunctionAppStack[] = [];
          stacksResponse.data.value.forEach(stack => {
            allFunctionAppStacks.push(stack.properties);
          });
          setFunctionAppStacks(allFunctionAppStacks);
        } else {
          loadingFailed = true;
        }
      } else {
        const stacksResponse = await RuntimeStackService.getWebAppConfigurationStacks(isLinux ? AppStackOs.linux : AppStackOs.windows);
        if (stacksResponse.metadata.status && !!stacksResponse.data.value) {
          const allWebAppStacks: WebAppStack[] = [];
          stacksResponse.data.value.forEach(stack => {
            allWebAppStacks.push(stack.properties);
          });
          setWebAppStacks(allWebAppStacks);
        } else {
          loadingFailed = true;
        }
      }
    }

    setLoadingFailure(loadingFailed);

    if (!loadingFailed) {
      setCurrentSiteNonForm(site.data);
      if (isFunctionApp(site.data)) {
        SiteService.fireSyncTrigger(site.data).then(r => {
          if (!r.metadata.success) {
            portalContext.log({
              action: 'fireSyncTrigger',
              actionModifier: 'failed',
              resourceId: resourceId,
              logLevel: 'error',
              data: {
                error: r.metadata.error,
                message: 'Failed to fire syncTrigger',
              },
            });
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
          azureStorageMounts: !!azureStorageMounts && azureStorageMounts.metadata.success ? azureStorageMounts.data : null,
          basicPublishingCredentialsPolicies: basicPublishingCredentialsPolicies.metadata.success
            ? basicPublishingCredentialsPolicies.data
            : null,
          appPermissions: appPermissions,
          errorPages: errorPagesResponse?.metadata.success ? errorPagesResponse.data : null,
        }),
      });
    }
    portalContext.log({
      action: 'loadAppSettings',
      actionModifier: 'load-complete',
      resourceId: resourceId,
      logLevel: 'info',
    });
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
    const [appSettingReferences, connectionStringReferences] = await Promise.all([
      getAllAppSettingReferences(resourceId),
      getAllConnectionStringsReferences(resourceId),
    ]);
    let appSettingsData;
    let connectionStringsData;
    if (appSettingReferences.metadata.success) {
      appSettingsData = getCleanedReferences(appSettingReferences.data);
    } else {
      portalContext.log({
        action: 'getAllAppSettingReferences',
        actionModifier: 'failed',
        resourceId: resourceId,
        logLevel: 'error',
        data: {
          error: appSettingReferences.metadata.error,
          message: 'Failed to fetch keyvault references for AppSettings',
        },
      });
    }

    if (connectionStringReferences.metadata.success) {
      connectionStringsData = getCleanedReferences(connectionStringReferences.data);
    } else {
      portalContext.log({
        action: 'getAllConnectionStringReferences',
        actionModifier: 'failed',
        resourceId: resourceId,
        logLevel: 'error',
        data: {
          error: connectionStringReferences.metadata.error,
          message: 'Failed to fetch keyvault references for ConnectionStrings',
        },
      });
    }

    setReferences({
      appSettings: appSettingsData,
      connectionStrings: connectionStringsData,
    });
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
    portalContext.hasFlightEnabled(ExperimentationConstants.TreatmentFlight.patchCallOnConfig).then(setUsePatchOnSubmit);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const scaleUpPlan = async () => {
    await portalContext.openBlade({
      detailBlade: 'ScaleSpecPicker.ReactView',
      detailBladeInputs: {
        id: currentSiteNonForm.properties.serverFarmId,
      },
      openAsContextBlade: true,
    });
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

  const isAzureStorageMountUpdated = (current: FormAzureStorageMounts[], origin: FormAzureStorageMounts[] | null) => {
    if (origin) {
      if (current.length !== origin.length) {
        return true;
      }
      return current.some(itemCurrent => {
        return !origin.some(itemOrigin => {
          return (
            itemOrigin.accessKey === itemCurrent.accessKey &&
            itemOrigin.accountName === itemCurrent.accountName &&
            itemOrigin.mountPath === itemCurrent.mountPath &&
            itemOrigin.name === itemCurrent.name &&
            itemOrigin.shareName === itemCurrent.shareName &&
            itemOrigin.type === itemCurrent.type &&
            itemOrigin.configurationOption === itemCurrent.configurationOption &&
            itemOrigin.storageAccess === itemCurrent.storageAccess &&
            itemOrigin.appSettings === itemCurrent.appSettings &&
            !!itemOrigin.sticky === !!itemCurrent.sticky
          );
        });
      });
    }
    return true;
  };

  const errorPagesUpdated = React.useCallback(
    (updatedErrorPage: FormErrorPage[], currentErrorPage: FormErrorPage[] = []) => {
      const filteredUpdatedErrorPages = updatedErrorPage.filter(errorPage => errorPage.content);
      const filteredCurrentErrorPages = currentErrorPage.filter(errorPage => !updatedErrorPage.find(e => e.key === errorPage.key));

      return [
        Promise.all(
          filteredUpdatedErrorPages.map(errorPage =>
            SiteService.AddOrUpdateCustomErrorPageForSite(resourceId, errorPage.errorCode, errorPage.content ?? '')
          )
        ),
        Promise.all(filteredCurrentErrorPages.map(errorPage => deleteCustomErrorPageForSite(resourceId, errorPage.errorCode))),
      ];
    },
    [resourceId]
  );

  const updateBasicPublishingAuthCredentials = React.useCallback(
    async (values: AppSettingsFormValues) => {
      let scmBasicPublishingCredentialsSuccess = true;
      let ftpBasicPublishingCredentialsSuccess = true;
      let scmBasicPublishingCredentialsError: any;
      let ftpBasicPublishingCredentialsError;

      if (values.basicPublishingCredentialsPolicies) {
        // NOTE(krmitta): Update scm only if the value has changed from before
        if (
          initialValues?.basicPublishingCredentialsPolicies?.properties.scm?.allow !==
          values.basicPublishingCredentialsPolicies?.properties.scm?.allow
        ) {
          const basicAuthCredentialsResponse = await SiteService.putBasicAuthCredentials(
            resourceId,
            values.basicPublishingCredentialsPolicies,
            'scm'
          );

          if (!basicAuthCredentialsResponse.metadata.success) {
            scmBasicPublishingCredentialsSuccess = false;
            scmBasicPublishingCredentialsError = basicAuthCredentialsResponse.metadata.error;
            portalContext.log({
              action: 'putScmBasicAuthCredentials',
              actionModifier: 'failed',
              resourceId: resourceId,
              logLevel: 'error',
              data: {
                error: basicAuthCredentialsResponse.metadata.error,
                message: 'Failed to update basic auth credentials',
              },
            });
          }
        }

        // NOTE(krmitta): Update ftp only if the value has changed from before
        if (
          initialValues?.basicPublishingCredentialsPolicies?.properties.ftp?.allow !==
          values.basicPublishingCredentialsPolicies?.properties.ftp?.allow
        ) {
          const basicAuthCredentialsResponse = await SiteService.putBasicAuthCredentials(
            resourceId,
            values.basicPublishingCredentialsPolicies,
            'ftp'
          );

          if (!basicAuthCredentialsResponse.metadata.success) {
            ftpBasicPublishingCredentialsSuccess = false;
            ftpBasicPublishingCredentialsError = basicAuthCredentialsResponse.metadata.error;
            portalContext.log({
              action: 'putFtpBasicAuthCredentials',
              actionModifier: 'failed',
              resourceId: resourceId,
              logLevel: 'error',
              data: {
                error: basicAuthCredentialsResponse.metadata.error,
                message: 'Failed to update basic auth credentials',
              },
            });
          }
        }
      }

      return {
        status: [scmBasicPublishingCredentialsSuccess, ftpBasicPublishingCredentialsSuccess],
        error: [scmBasicPublishingCredentialsError, ftpBasicPublishingCredentialsError],
      };
    },
    [initialValues, resourceId, portalContext]
  );

  const updateCustomErrorPages = React.useCallback(
    async (values: AppSettingsFormValues) => {
      const [updatedErrorPagesPromise, deleteErrorPagesPromise] = errorPagesUpdated(values.errorPages, initialValues?.errorPages);
      const updatedErrorPagesPromiseResolved = await updatedErrorPagesPromise;
      const deleteErrorPagesPromiseResolved = await deleteErrorPagesPromise;
      const errorPageUpdateSuccess = !updatedErrorPagesPromiseResolved.some(promiseResponse => !promiseResponse.metadata.success);
      const errorPageDeleteSuccess = !deleteErrorPagesPromiseResolved.some(promiseResponse => !promiseResponse.metadata.success);

      const errorPageUpdateError = updatedErrorPagesPromiseResolved.flatMap(errorPage => {
        if (!errorPage.metadata.success) {
          return errorPage.metadata.error;
        } else {
          return [];
        }
      })[0];

      const errorPageDeleteError = deleteErrorPagesPromiseResolved.flatMap(errorPage => {
        if (!errorPage.metadata.success) {
          return errorPage.metadata.error;
        } else {
          return [];
        }
      })[0];

      return {
        status: [errorPageUpdateSuccess, errorPageDeleteSuccess],
        error: [errorPageUpdateError, errorPageDeleteError],
      };
    },
    [initialValues, errorPagesUpdated]
  );

  const onSubmit = async (values: AppSettingsFormValues) => {
    setSaving(true);
    const notificationId = portalContext.startNotification(t('configUpdating'), t('configUpdating'));
    const { site, slotConfigNames, slotConfigNamesModified } = convertFormToState(
      values,
      metadataFromApi,
      initialValues!,
      slotConfigNamesFromApi
    );

    const shouldUpdateAzureStorageMount = isAzureStorageMountUpdated(
      values.azureStorageMounts,
      initialValues && initialValues.azureStorageMounts
    );
    let configSettingToIgnore = SiteService.getSiteConfigSettingsToIgnore();
    if (shouldUpdateAzureStorageMount) {
      configSettingToIgnore = configSettingToIgnore.filter(config => config !== 'azureStorageAccounts');
    }

    const [siteResult, slotConfigNamesResult, basicAuthCredentialsResult, customErrorPageResult] = await Promise.all([
      updateSite(resourceId, site, configSettingToIgnore, usePatchOnSubmit),
      productionPermissions && slotConfigNamesModified ? updateSlotConfigNames(resourceId, slotConfigNames) : Promise.resolve(null),
      updateBasicPublishingAuthCredentials(values),
      updateCustomErrorPages(values),
    ]);

    const {
      status: [scmBasicPublishingCredentialsSuccess, ftpBasicPublishingCredentialsSuccess],
      error: [scmBasicPublishingCredentialsError, ftpBasicPublishingCredentialsError],
    } = basicAuthCredentialsResult;
    const {
      status: [errorPageUpdateSuccess, errorPageDeleteSuccess],
      error: [errorPageUpdateError, errorPageDeleteError],
    } = customErrorPageResult;

    const success =
      siteResult!.metadata.success &&
      (!slotConfigNamesResult || slotConfigNamesResult.metadata.success) &&
      errorPageDeleteSuccess &&
      errorPageUpdateSuccess &&
      ftpBasicPublishingCredentialsSuccess &&
      scmBasicPublishingCredentialsSuccess;
    if (success) {
      setInitialValues({
        ...values,
      });
      if (slotConfigNamesResult) {
        setSlotConfigNamesFromApi(slotConfigNamesResult.data);
      }

      fetchReferences();
      if (isFunctionApp(site)) {
        SiteService.fireSyncTrigger(site).then(r => {
          if (!r.metadata.success) {
            portalContext.log({
              action: 'fireSyncTrigger',
              actionModifier: 'failed',
              resourceId: resourceId,
              logLevel: 'error',
              data: {
                error: r.metadata.error,
                message: 'Failed to fire sync trigger',
              },
            });
          }
          fetchAsyncData();
        });
      }
      portalContext.stopNotification(notificationId, true, t('configUpdateSuccess'));
    } else {
      const [
        siteError,
        slotConfigError,
        errorPageDeleteErrorMsg,
        errorPageUpdateErrorMsg,
        scmBasicPublishingCredentialsErrorMsg,
        ftpBasicPublishingCredentialsErrorMsg,
      ] = [
        getErrorMessage(siteResult!.metadata.error),
        getErrorMessage(slotConfigNamesResult && slotConfigNamesResult.metadata.error),
        getErrorMessage(errorPageDeleteError),
        getErrorMessage(errorPageUpdateError),
        getErrorMessage(scmBasicPublishingCredentialsError),
        getErrorMessage(ftpBasicPublishingCredentialsError),
      ];

      const errorMessage =
        siteError ||
        slotConfigError ||
        errorPageDeleteErrorMsg ||
        errorPageUpdateErrorMsg ||
        scmBasicPublishingCredentialsErrorMsg ||
        ftpBasicPublishingCredentialsErrorMsg;
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
    setReferences(undefined);
  }

  return (
    <WebAppStacksContext.Provider value={webAppStacks}>
      <FunctionAppStacksContext.Provider value={functionAppStacks}>
        <PermissionsContext.Provider value={{ editable, saving, app_write: appPermissions, production_write: productionPermissions }}>
          <StorageAccountsContext.Provider value={storageAccountsState}>
            <SiteContext.Provider value={currentSiteNonForm}>
              <SlotsListContext.Provider value={slotList}>
                {children({
                  onSubmit,
                  scaleUpPlan,
                  asyncData,
                  refreshAppSettings,
                  setInitialValues,
                  initialFormValues: initialValues,
                })}
              </SlotsListContext.Provider>
            </SiteContext.Provider>
          </StorageAccountsContext.Provider>
        </PermissionsContext.Provider>
      </FunctionAppStacksContext.Provider>
    </WebAppStacksContext.Provider>
  );
};

export default AppSettingsDataLoader;
