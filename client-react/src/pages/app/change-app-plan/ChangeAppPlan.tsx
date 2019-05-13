import React, { useContext, useState, useEffect } from 'react';
import FeatureDescriptionCard from '../../../components/feature-description-card/FeatureDescriptionCard';
import { PrimaryButton, IDropdownOption, Stack } from 'office-ui-fabric-react';
import { Formik, FormikProps } from 'formik';
import { ResourceGroup } from '../../../models/resource-group';
import { ArmObj, Site, ServerFarm, ArmSku } from '../../../models/WebAppModels';
import { style } from 'typestyle';
import { ArmSiteDescriptor, ArmPlanDescriptor } from '../../../utils/resourceDescriptors';
import { CreateOrSelectPlan, CreateOrSelectPlanFormValues, NEW_PLAN, addNewPlanToOptions } from './CreateOrSelectPlan';
import SiteService from '../../../ApiHelpers/SiteService';
import ResourceGroupService from '../../../ApiHelpers/ResourceGroupService';
import ServerFarmService from '../../../ApiHelpers/ServerFarmService';
import { PortalContext } from '../../../PortalContext';
import PortalCommunicator from '../../../portal-communicator';
import { getDefaultServerFarmName } from '../../../utils/formValidation/serverFarmValidator';
import { addNewRgOption } from './CreateOrSelectResourceGroup';
import LogService from '../../../utils/LogService';
import { ReactComponent as AppServicePlanSvg } from '../../../images/AppService/app-service-plan.svg';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

export const leftCol = style({
  marginRight: '20px',
});

export const linkStyle = style({
  color: '#015cda',
  cursor: 'pointer',
});

const formStyle = {
  marginTop: '50px',
};

const fieldStyle = {
  marginTop: '20px',
};

const labelStyle = style({
  width: '250px',
});

const footerStyle = style({
  marginTop: '50px',
});

interface CompletionTelemetry {
  success: boolean;
  newResourceGroup: boolean;
  newPlan: boolean;
  message?: string;
}

export interface ChangeAppPlanProps {
  site: ArmObj<Site>;
  currentServerFarm: ArmObj<ServerFarm>;
  resourceGroups: ArmObj<ResourceGroup>[];
  serverFarms: ArmObj<ServerFarm>[];
  onChangeComplete: () => void;
}

export interface ChangeAppPlanFormValues {
  site: ArmObj<Site>;
  currentServerFarm: ArmObj<ServerFarm>;
  serverFarmInfo: CreateOrSelectPlanFormValues;
}

const getCompletionTelemtry = (success: boolean, newResourceGroup: boolean, newPlan: boolean, message?: string): CompletionTelemetry => {
  return {
    success,
    newResourceGroup,
    newPlan,
    message,
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
  const { site, currentServerFarm, serverFarmInfo } = values;
  const notificationId = portalCommunicator.startNotification(t('changePlanNotification'), t('changePlanNotification'));
  setFormValues(values);
  setIsUpdating(true);

  if (!serverFarmInfo.isNewPlan) {
    // Change to an existing plan

    if (!serverFarmInfo.existingPlan) {
      LogService.trackEvent('/ChangeAppPlan', 'onSubmit', getCompletionTelemtry(false, false, false, 'existingPlan not set'));
      return;
    }

    site.properties.serverFarmId = serverFarmInfo.existingPlan.id;

    const planDescriptor = new ArmPlanDescriptor(site.properties.serverFarmId);

    const siteResponse = await SiteService.updateSite(site.id, site);
    if (siteResponse.metadata.success) {
      portalCommunicator.stopNotification(notificationId, true, t('changePlanNotification'));
      LogService.trackEvent('/ChangeAppPlan', 'onSubmit', getCompletionTelemtry(true, false, false));
    } else {
      const updateSiteError =
        siteResponse.metadata.error && siteResponse.metadata.error.Message ? siteResponse.metadata.error.Message : planDescriptor.name;
      portalCommunicator.stopNotification(notificationId, false, t('changePlanFailureNotificationFormat').format(updateSiteError));
      LogService.trackEvent('/ChangeAppPlan', 'onSubmit', getCompletionTelemtry(false, false, false, 'Failed to update site'));

      setIsUpdating(false);
      return;
    }
  } else {
    // Create a new plan

    const siteDescriptor = new ArmSiteDescriptor(site.id);
    let rgName = siteDescriptor.resourceGroup;

    if (serverFarmInfo.newPlanInfo.isNewResourceGroup) {
      const rgResponse = await ResourceGroupService.updateResourceGroup(
        siteDescriptor.subscription,
        serverFarmInfo.newPlanInfo.newResourceGroupName,
        site.location
      );

      if (!rgResponse.metadata.success) {
        const createRgError = rgResponse.metadata.error && rgResponse.metadata.error.Message ? rgResponse.metadata.error.Message : rgName;
        portalCommunicator.stopNotification(notificationId, false, t('changePlanRgCreateFailureNotificationFormat').format(createRgError));
        LogService.trackEvent('/ChangeAppPlan', 'onSubmit', getCompletionTelemtry(false, true, true, 'Failed to update resource group'));

        setIsUpdating(false);
        return;
      }

      rgName = serverFarmInfo.newPlanInfo.newResourceGroupName;
    }

    const newServerFarmId = `/subscriptions/${siteDescriptor.subscription}/resourceGroups/${rgName}/providers/Microsoft.Web/serverFarms/${
      serverFarmInfo.newPlanInfo.name
    }`;

    const newServerFarm = {
      id: newServerFarmId,
      name: serverFarmInfo.newPlanInfo.name,
      location: site.location,
      properties: {
        webSiteId: site.id,
      },
      sku: {
        name: currentServerFarm.sku ? currentServerFarm.sku.name : '',
      },
    };

    const planDescriptor = new ArmPlanDescriptor(newServerFarmId);
    newServerFarm.properties.webSiteId = site.id;

    const serverFarmResponse = await ServerFarmService.updateServerFarm(newServerFarmId, newServerFarm as ArmObj<ServerFarm>);
    if (!serverFarmResponse.metadata.success) {
      const createPlanError =
        serverFarmResponse.metadata.error && serverFarmResponse.metadata.error.Message
          ? serverFarmResponse.metadata.error.Message
          : planDescriptor.name;
      portalCommunicator.stopNotification(
        notificationId,
        false,
        t('changePlanPlanCreateFailureNotificationFormat').format(createPlanError)
      );

      LogService.trackEvent(
        '/ChangeAppPlan',
        'onSubmit',
        getCompletionTelemtry(false, serverFarmInfo.newPlanInfo.isNewResourceGroup, true, 'Failed to create new serverfarm')
      );

      setIsUpdating(false);
      return;
    }

    site.properties.serverFarmId = newServerFarmId;

    const siteResponse = await SiteService.updateSite(site.id, site);
    if (!siteResponse.metadata.success) {
      const updateSiteError =
        siteResponse.metadata.error && siteResponse.metadata.error.Message ? siteResponse.metadata.error.Message : planDescriptor.name;
      portalCommunicator.stopNotification(notificationId, false, t('changePlanFailureNotificationFormat').format(updateSiteError));

      LogService.trackEvent(
        '/ChangeAppPlan',
        'onSubmit',
        getCompletionTelemtry(false, serverFarmInfo.newPlanInfo.isNewResourceGroup, serverFarmInfo.isNewPlan, 'Failed to update site')
      );

      setIsUpdating(false);
      return;
    }

    portalCommunicator.stopNotification(notificationId, true, t('changePlanNotification'));
  }

  changeComplete();
  setIsUpdating(false);
};

const getSelectedSkuString = (values: ChangeAppPlanFormValues) => {
  let sku: ArmSku;
  if (values.serverFarmInfo.isNewPlan) {
    sku = values.currentServerFarm.sku as ArmSku;
  } else {
    sku = (values.serverFarmInfo.existingPlan as ArmObj<ServerFarm>).sku as ArmSku;
  }

  return `${sku.tier} (${sku.name}) `;
};

const getSelectedResourceGroupString = (values: CreateOrSelectPlanFormValues, t: i18next.TFunction) => {
  if (values.isNewPlan) {
    if (values.newPlanInfo.isNewResourceGroup) {
      return t('newFormat').format(values.newPlanInfo.newResourceGroupName);
    }

    return `${(values.newPlanInfo.existingResourceGroup as ArmObj<ResourceGroup>).name}`;
  }

  const planDescriptor = new ArmPlanDescriptor((values.existingPlan as ArmObj<ServerFarm>).id);
  return `${planDescriptor.resourceGroup}`;
};

const getPlanName = (serverFarm: ArmObj<ServerFarm>) => {
  const descriptor = new ArmPlanDescriptor(serverFarm.id);
  return descriptor.name;
};

const getDropdownOptions = (objs: ArmObj<any>[]) => {
  let options: IDropdownOption[] = [];
  if (objs) {
    for (let i = 0; i < objs.length; i = i + 1) {
      options = [
        ...options,
        {
          key: objs[i].id,
          text: objs[i].name,
          data: objs[i],
          selected: i === 0,
        },
      ];
    }
  }

  return options;
};

const getInitialFormValues = (
  site: ArmObj<Site>,
  currentServerFarm: ArmObj<ServerFarm>,
  serverFarms: ArmObj<ServerFarm>[],
  resourceGroups: ArmObj<ResourceGroup>[]
): ChangeAppPlanFormValues => {
  const existingPlan = serverFarms.length > 0 ? serverFarms[0] : null;
  const existingResourceGroup = resourceGroups.length > 0 ? resourceGroups[0] : null;

  const siteDescriptor = new ArmSiteDescriptor(site.id);

  return {
    site,
    currentServerFarm,
    serverFarmInfo: {
      existingPlan,
      isNewPlan: !existingPlan,
      newPlanInfo: {
        existingResourceGroup,
        isNewResourceGroup: !existingResourceGroup,
        newResourceGroupName: '',
        name: getDefaultServerFarmName(siteDescriptor.resourceName),
      },
    },
  };
};

export const ChangeAppPlan: React.SFC<ChangeAppPlanProps> = props => {
  const { resourceGroups, serverFarms, site, currentServerFarm, onChangeComplete: onChangeComplete } = props;
  const [isUpdating, setIsUpdating] = useState(false);
  const portalCommunicator = useContext(PortalContext);
  const { t } = useTranslation();

  const [formValues, setFormValues] = useState<ChangeAppPlanFormValues>(
    getInitialFormValues(site, currentServerFarm, serverFarms, resourceGroups)
  );

  useEffect(() => {
    if (isUpdating) {
      portalCommunicator.updateDirtyState(true, t('cancelUpdateConfirmation'));
    } else {
      portalCommunicator.updateDirtyState(false);
    }
  }, [isUpdating]);

  const rgOptions = getDropdownOptions(resourceGroups);
  addNewRgOption(formValues.serverFarmInfo.newPlanInfo.newResourceGroupName, rgOptions, t);

  const serverFarmOptions = getDropdownOptions(serverFarms);
  addNewPlanToOptions(formValues.serverFarmInfo.newPlanInfo.name, serverFarmOptions, t);

  const onPlanChange = (form: FormikProps<ChangeAppPlanFormValues>, planInfo: CreateOrSelectPlanFormValues) => {
    form.setFieldValue('serverFarmInfo', planInfo);
  };

  if (rgOptions.length === 0) {
    const newResourceGroupName = formValues.serverFarmInfo.newPlanInfo.newResourceGroupName;
    rgOptions.unshift({
      key: newResourceGroupName,
      text: newResourceGroupName,
      data: newResourceGroupName,
      selected: true,
    });
  }

  if (serverFarmOptions.length === 0) {
    serverFarmOptions.unshift({
      key: formValues.serverFarmInfo.newPlanInfo.name,
      text: t('newFormat').format(formValues.serverFarmInfo.newPlanInfo.name),
      data: NEW_PLAN,
      selected: true,
    });
  }

  const subscriptionId = new ArmPlanDescriptor(currentServerFarm.id).subscription;

  return (
    <>
      <Formik
        initialValues={formValues}
        onSubmit={values => onSubmit(values, setIsUpdating, setFormValues, portalCommunicator, t, onChangeComplete)}>
        {(formProps: FormikProps<ChangeAppPlanFormValues>) => {
          return (
            <form>
              <header>
                <FeatureDescriptionCard name={t('changePlanName')} description={t('changePlanDescription')} Svg={AppServicePlanSvg} />
              </header>

              <section>
                <Stack style={formStyle}>
                  <Stack horizontal disableShrink>
                    <label className={labelStyle}>{t('changePlanCurrentPlan')}</label>
                    <div>{getPlanName(currentServerFarm)}</div>
                  </Stack>

                  <Stack horizontal disableShrink style={{ marginTop: '25px' }}>
                    <label className={labelStyle}>{t('changePlanDestPlan')}</label>
                    <CreateOrSelectPlan
                      subscriptionId={subscriptionId}
                      isNewPlan={formProps.values.serverFarmInfo.isNewPlan}
                      newPlanInfo={formProps.values.serverFarmInfo.newPlanInfo}
                      existingPlan={formProps.values.serverFarmInfo.existingPlan}
                      options={serverFarmOptions}
                      resourceGroupOptions={rgOptions}
                      onPlanChange={info => {
                        onPlanChange(formProps, info);
                      }}
                      serverFarmsInWebspace={serverFarms}
                    />
                  </Stack>

                  <Stack horizontal disableShrink style={{ marginTop: '45px' }}>
                    <label className={labelStyle}>Resource Group</label>
                    <div>{getSelectedResourceGroupString(formProps.values.serverFarmInfo, t)}</div>
                  </Stack>

                  <Stack horizontal disableShrink style={fieldStyle}>
                    <label className={labelStyle}>Region</label>
                    <span>{site.location}</span>
                  </Stack>

                  <Stack horizontal disableShrink style={fieldStyle}>
                    <label className={labelStyle}>Pricing Tier</label>
                    <span>{getSelectedSkuString(formProps.values)}</span>
                  </Stack>
                </Stack>
              </section>

              <footer className={footerStyle}>
                <PrimaryButton
                  data-automation-id="test"
                  text={t('ok')}
                  allowDisabledFocus={true}
                  onClick={formProps.submitForm}
                  disabled={isUpdating}
                />
              </footer>
            </form>
          );
        }}
      </Formik>
    </>
  );
};
