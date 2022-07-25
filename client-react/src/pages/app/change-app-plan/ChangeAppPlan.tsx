import { Formik, FormikProps } from 'formik';
import i18next from 'i18next';
import { Link, MessageBar, MessageBarType, Stack } from '@fluentui/react';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '../../../ApiHelpers/ArmHelper';
import ResourceGroupService from '../../../ApiHelpers/ResourceGroupService';
import ServerFarmService from '../../../ApiHelpers/ServerFarmService';
import SiteService from '../../../ApiHelpers/SiteService';
import { ArmObj, ArmSku } from '../../../models/arm-obj';
import { BroadcastMessageId, KeyValue } from '../../../models/portal-models';
import { ResourceGroup } from '../../../models/resource-group';
import { ServerFarm } from '../../../models/serverFarm/serverfarm';
import { Site } from '../../../models/site/site';
import PortalCommunicator from '../../../portal-communicator';
import { PortalContext } from '../../../PortalContext';
import { LogCategories } from '../../../utils/LogCategories';
import { ArmPlanDescriptor, ArmSiteDescriptor } from '../../../utils/resourceDescriptors';
import { ScenarioIds } from '../../../utils/scenario-checker/scenario-ids';
import { ScenarioService } from '../../../utils/scenario-checker/scenario.service';
import { getDefaultServerFarmName } from '../../../utils/validation/serverFarmValidator';
import { Links } from '../../../utils/FwLinks';
import { formStyle, wrapperStyle } from './ChangeAppPlan.styles';
import {
  ChangeAppPlanFormValues,
  ChangeAppPlanProps,
  ChangeAppPlanTierTypes,
  CreateOrSelectPlanFormValues,
  NewServerFarmInfo,
} from './ChangeAppPlan.types';

import { ChangeAppPlanFooter } from './ChangeAppPlanFooter';
import { CurrentPlanDetails } from './ChangeAppPlanCurrentPlanDetails';
import { DestinationPlanDetails } from './ChangeAppPlanDestinationPlanDetails';
import { ChangeAppPlanHeader } from './ChangeAppPlanHeader';
import { LogLevel, TelemetryInfo } from '../../../models/telemetry';
import { CommonConstants } from '../../../utils/CommonConstants';

export const ChangeAppPlan: React.SFC<ChangeAppPlanProps> = props => {
  const { serverFarms, resourceGroups, site, currentServerFarm, hostingEnvironment, onChangeComplete } = props;

  const [isUpdating, setIsUpdating] = useState(false);
  const [siteIsReadOnlyLocked, setSiteIsReadOnlyLocked] = useState(false);
  const [showAppDensityWarning, setShowAppDensityWarning] = useState(false);
  const [formValues, setFormValues] = useState<ChangeAppPlanFormValues>(getInitialFormValues(site, currentServerFarm));

  const portalCommunicator = useContext(PortalContext);

  const { t } = useTranslation();

  // Initialization
  useEffect(() => {
    checkIfSiteIsLocked(portalCommunicator, site.id, setSiteIsReadOnlyLocked);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isUpdating) {
      portalCommunicator.updateDirtyState(true, t('cancelUpdateConfirmation'));
    } else {
      portalCommunicator.updateDirtyState(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpdating]);

  useEffect(() => {
    updateAppDensityWarning(setShowAppDensityWarning, formValues.serverFarmInfo, t);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues, formValues.serverFarmInfo]);

  return (
    <>
      {getWarningBar(siteIsReadOnlyLocked, t, showAppDensityWarning, formValues)}
      <div className={wrapperStyle}>
        <Formik
          initialValues={formValues}
          onSubmit={values => onSubmit(values, setIsUpdating, setFormValues, portalCommunicator, t, onChangeComplete)}>
          {(formProps: FormikProps<ChangeAppPlanFormValues>) => {
            return (
              <form>
                <ChangeAppPlanHeader />
                <section>
                  <Stack className={formStyle}>
                    <CurrentPlanDetails currentServerFarm={currentServerFarm} />
                    <DestinationPlanDetails
                      isUpdating={isUpdating}
                      currentServerFarm={currentServerFarm}
                      hostingEnvironment={hostingEnvironment}
                      serverFarms={serverFarms}
                      resourceGroups={resourceGroups}
                      formProps={formProps}
                    />
                  </Stack>
                </section>
                <ChangeAppPlanFooter
                  formProps={formProps}
                  submitForm={formProps.submitForm}
                  isUpdating={isUpdating}
                  siteIsReadOnlyLocked={siteIsReadOnlyLocked}
                />
              </form>
            );
          }}
        </Formik>
      </div>
    </>
  );
};

const checkIfSiteIsLocked = async (
  portalCommunicator: PortalCommunicator,
  resourceId: string,
  setSiteIsReadOnlyLocked: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const readOnly = await portalCommunicator.hasLock(resourceId, 'ReadOnly');
  setSiteIsReadOnlyLocked(readOnly);
};

const updateAppDensityWarning = async (
  setShowAppDensityWarning: React.Dispatch<React.SetStateAction<boolean>>,
  planInfo: CreateOrSelectPlanFormValues,
  t: any
) => {
  const scenarioChecker = new ScenarioService(t);
  if (!planInfo.isNewPlan && planInfo.existingPlan && planInfo.existingPlan.id && planInfo.existingPlan.sku) {
    scenarioChecker.checkScenarioAsync(ScenarioIds.isAppDensityEnabled, { serverFarm: planInfo.existingPlan }).then(result => {
      setShowAppDensityWarning(result.status !== 'disabled');
    });
  } else {
    setShowAppDensityWarning(false);
  }
};

const getWarningBar = (
  siteIsReadOnlyLocked: boolean,
  t: i18next.TFunction,
  showAppDensityWarning: boolean,
  formValues: ChangeAppPlanFormValues
) => {
  if (siteIsReadOnlyLocked) {
    return <MessageBar messageBarType={MessageBarType.warning}>{t('changePlanSiteLockedError')}</MessageBar>;
  }

  if (showAppDensityWarning) {
    const planName = !!formValues.serverFarmInfo.existingPlan && formValues.serverFarmInfo.existingPlan.name;
    return (
      <MessageBar messageBarType={MessageBarType.warning}>
        {t('pricing_appDensityWarningMessage').format(planName)}
        <Link href={Links.appDensityWarningLink} target="_blank">
          {t('learnMore')}
        </Link>
      </MessageBar>
    );
  }
};

const getCompletionTelemetry = (
  success: boolean,
  newResourceGroup: boolean,
  newPlan: boolean,
  resourceId?: string,
  message?: string,
  currentServerFarmSkuTier?: string,
  newServerFarmSkuTier?: string
) => {
  return {
    success: String(success),
    newResourceGroup: String(newResourceGroup),
    newPlan: String(newPlan),
    resourceId: resourceId || '',
    message: message || '',
    currentServerFarmSkuTier: currentServerFarmSkuTier || '',
    newServerFarmSkuTier: newServerFarmSkuTier || '',
  };
};

const onSubmit = async (
  values: ChangeAppPlanFormValues,
  setIsUpdating: React.Dispatch<React.SetStateAction<boolean>>,
  setFormValues: React.Dispatch<React.SetStateAction<ChangeAppPlanFormValues>>,
  portalCommunicator: PortalCommunicator,
  t: i18next.TFunction,
  changeComplete: () => void
) => {
  const { serverFarmInfo } = values;
  const notificationId = portalCommunicator.startNotification(t('changePlanNotification'), t('changePlanNotification'));

  setFormValues(values);
  setIsUpdating(true);

  let success = false;
  if (!serverFarmInfo.isNewPlan) {
    success = await changeSiteToExistingPlan(notificationId, values, portalCommunicator, t);
  } else {
    success = await changeSiteToNewPlan(notificationId, values, portalCommunicator, t);
  }

  if (success) {
    changeComplete();
    portalCommunicator.broadcastMessage(BroadcastMessageId.siteUpdated, values.site.id);
  }

  setIsUpdating(false);
};

const changeSiteToExistingPlan = async (
  notificationId: string,
  formValues: ChangeAppPlanFormValues,
  portalCommunicator: PortalCommunicator,
  t: i18next.TFunction
) => {
  const { site, serverFarmInfo } = formValues;
  let success = false;

  if (!serverFarmInfo.existingPlan) {
    portalCommunicator.log(
      getTelemetryInfo('info', 'changeAppPlanSubmitted', 'submit', getCompletionTelemetry(false, false, false, '', 'existingPlan not set'))
    );
    return success;
  }

  site.properties.serverFarmId = serverFarmInfo.existingPlan.id;

  const planDescriptor = new ArmPlanDescriptor(site.properties.serverFarmId);
  const currentServerFarmSku = formValues.currentServerFarm.sku?.tier;
  const existingPlanServerFarmSku = serverFarmInfo.existingPlan.sku?.tier;

  const siteResponse = await SiteService.updateSite(site.id, site);
  if (siteResponse.metadata.success) {
    portalCommunicator.stopNotification(notificationId, true, t('changePlanNotification'));
    portalCommunicator.log(
      getTelemetryInfo(
        'info',
        'changeAppPlanSubmitted',
        'submit',
        getCompletionTelemetry(true, false, false, site.id, '', currentServerFarmSku, existingPlanServerFarmSku)
      )
    );

    success = true;
  } else {
    const updateSiteError = getErrorMessage(siteResponse.metadata.error) || planDescriptor.name;
    portalCommunicator.stopNotification(notificationId, false, t('changePlanFailureNotificationFormat').format(updateSiteError));
    portalCommunicator.log(
      getTelemetryInfo(
        'info',
        'changeAppPlanSubmitted',
        'submit',
        getCompletionTelemetry(
          false,
          false,
          false,
          site.id,
          `Failed to update site: '${updateSiteError}'`,
          currentServerFarmSku,
          existingPlanServerFarmSku
        )
      )
    );
  }

  return success;
};

const changeSiteToNewPlan = async (
  notificationId: string,
  formValues: ChangeAppPlanFormValues,
  portalCommunicator: PortalCommunicator,
  t: i18next.TFunction
) => {
  const { site, serverFarmInfo, currentServerFarm } = formValues;
  const siteDescriptor = new ArmSiteDescriptor(site.id);
  let rgName = serverFarmInfo.newPlanInfo.existingResourceGroup?.name ?? siteDescriptor.resourceGroup;
  const currentServerFarmSku = currentServerFarm.sku?.tier;
  const newPlanServerFarmSku = serverFarmInfo.newPlanInfo?.tier;

  if (serverFarmInfo.newPlanInfo.isNewResourceGroup) {
    const rgResponse = await ResourceGroupService.updateResourceGroup(
      siteDescriptor.subscription,
      serverFarmInfo.newPlanInfo.newResourceGroupName,
      site.location
    );

    if (!rgResponse.metadata.success) {
      const createRgError = getErrorMessage(rgResponse.metadata.error) || siteDescriptor.resourceGroup;
      portalCommunicator.stopNotification(notificationId, false, t('changePlanRgCreateFailureNotificationFormat').format(createRgError));
      portalCommunicator.log(
        getTelemetryInfo(
          'info',
          'changeAppPlanSubmitted',
          'submit',
          getCompletionTelemetry(
            false,
            true,
            true,
            `/subscriptions/${siteDescriptor.subscription}/resourceGroups/${serverFarmInfo.newPlanInfo.newResourceGroupName}`,
            `Failed to update resource group: ${createRgError}`,
            currentServerFarmSku,
            newPlanServerFarmSku
          )
        )
      );

      return false;
    }

    rgName = serverFarmInfo.newPlanInfo.newResourceGroupName;
  }

  const newServerFarmId = `/subscriptions/${siteDescriptor.subscription}/resourceGroups/${rgName}/providers/Microsoft.Web/serverFarms/${serverFarmInfo.newPlanInfo.name}`;

  // Purposely ignoring slots to avoid a back-end bug where if webSiteId is a slot resourceId, then you'll get a 404 on create.
  // This works because slots always have the same webspace as prod sites.
  const webSiteId = `/subscriptions/${siteDescriptor.subscription}/resourceGroups/${siteDescriptor.resourceGroup}/providers/Microsoft.Web/sites/${siteDescriptor.site}`;

  const newServerFarm: NewServerFarmInfo = {
    id: newServerFarmId,
    name: serverFarmInfo.newPlanInfo.name,
    location: site.location,
    kind: currentServerFarm.kind,
    properties: {
      webSiteId,
      reserved: currentServerFarm.properties.reserved,
      hyperV: currentServerFarm.properties.hyperV,
      hostingEnvironmentId: currentServerFarm.properties.hostingEnvironmentId,
      hostingEnvironmentProfile: currentServerFarm.properties.hostingEnvironmentProfile,
    },
    sku: {
      name: getSelectedSkuCode(formValues),
    },
  };

  if (newPlanServerFarmSku?.toLocaleLowerCase() === ChangeAppPlanTierTypes.ElasticPremium.toLocaleLowerCase()) {
    newServerFarm.properties = {
      ...newServerFarm.properties,
      maximumElasticWorkerCount: CommonConstants.FunctionAppServicePlanConstants.defaultMaximumElasticWorkerCount,
    };
  }

  const planDescriptor = new ArmPlanDescriptor(newServerFarmId);
  const serverFarmResponse = await ServerFarmService.updateServerFarm(newServerFarmId, newServerFarm as ArmObj<ServerFarm>);

  if (!serverFarmResponse.metadata.success) {
    const createPlanError = getErrorMessage(serverFarmResponse.metadata.error) || planDescriptor.name;
    portalCommunicator.stopNotification(notificationId, false, t('changePlanPlanCreateFailureNotificationFormat').format(createPlanError));

    portalCommunicator.log(
      getTelemetryInfo(
        'info',
        'changeAppPlanSubmitted',
        'submit',
        getCompletionTelemetry(
          false,
          serverFarmInfo.newPlanInfo.isNewResourceGroup,
          true,
          newServerFarmId,
          `Failed to create new serverfarm: '${createPlanError}'`,
          currentServerFarmSku,
          newPlanServerFarmSku
        )
      )
    );

    return false;
  }

  site.properties.serverFarmId = newServerFarmId;

  const siteResponse = await SiteService.updateSite(site.id, site);
  if (!siteResponse.metadata.success) {
    const updateSiteError = getErrorMessage(siteResponse.metadata.error) || planDescriptor.name;
    portalCommunicator.stopNotification(notificationId, false, t('changePlanFailureNotificationFormat').format(updateSiteError));

    portalCommunicator.log(
      getTelemetryInfo(
        'info',
        'changeAppPlanSubmitted',
        'submit',
        getCompletionTelemetry(
          false,
          serverFarmInfo.newPlanInfo.isNewResourceGroup,
          serverFarmInfo.isNewPlan,
          site.id,
          `Failed to update site: '${updateSiteError}'`,
          currentServerFarmSku,
          newPlanServerFarmSku
        )
      )
    );

    return false;
  }

  portalCommunicator.stopNotification(notificationId, true, t('changePlanNotification'));
  portalCommunicator.log(
    getTelemetryInfo(
      'info',
      'changeAppPlanSubmitted',
      'submit',
      getCompletionTelemetry(
        true,
        serverFarmInfo.newPlanInfo.isNewResourceGroup,
        serverFarmInfo.isNewPlan,
        site.id,
        currentServerFarmSku,
        newPlanServerFarmSku
      )
    )
  );

  return true;
};

const getSelectedSkuCode = (values: ChangeAppPlanFormValues) => {
  if (values.serverFarmInfo.isNewPlan) {
    return values.serverFarmInfo.newPlanInfo.skuCode;
  }

  return ((values.serverFarmInfo.existingPlan as ArmObj<ServerFarm>).sku as ArmSku).name;
};

const getInitialFormValues = (site: ArmObj<Site>, currentServerFarm: ArmObj<ServerFarm>): ChangeAppPlanFormValues => {
  const planDescriptor = new ArmPlanDescriptor(currentServerFarm.id);

  const existingResourceGroup: ArmObj<ResourceGroup> = {
    id: `/subscriptions/${planDescriptor.subscription}/resourceGroups/${planDescriptor.resourceGroup}`,
    properties: {},
    location: '',
    name: planDescriptor.resourceGroup,
  };

  const siteDescriptor = new ArmSiteDescriptor(site.id);
  const skuCode = currentServerFarm.sku ? currentServerFarm.sku.name : '';
  const tier = currentServerFarm.sku ? currentServerFarm.sku.tier : '';

  return {
    site,
    currentServerFarm,
    serverFarmInfo: {
      existingPlan: null,
      isNewPlan: false,
      newPlanInfo: {
        existingResourceGroup,
        skuCode,
        tier,
        hasSubscriptionWritePermission: true,
        isNewResourceGroup: false,
        newResourceGroupName: '',
        name: getDefaultServerFarmName(siteDescriptor.resourceName),
      },
    },
  };
};

export const getTelemetryInfo = (
  logLevel: LogLevel,
  action: string,
  actionModifier: string,
  data?: KeyValue<string | undefined>
): TelemetryInfo => {
  const identifiers = window.appsvc
    ? {
        resourceId: window.appsvc.resourceId,
        version: window.appsvc.version,
        sessionId: window.appsvc.sessionId,
        feature: window.appsvc.feature,
      }
    : {};

  const dataContent = data ? data : {};

  return {
    action,
    actionModifier,
    logLevel,
    resourceId: identifiers.resourceId ? identifiers.resourceId : '',
    data: {
      category: LogCategories.changeAppPlan,
      ...dataContent,
      ...identifiers,
    },
  };
};
