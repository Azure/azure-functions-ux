import { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage, getErrorMessageOrStringify } from '../../../../ApiHelpers/ArmHelper';
import { ArmObj } from '../../../../models/arm-obj';
import { FunctionTemplate } from '../../../../models/functions/function-template';
import { HostStatus } from '../../../../models/functions/host-status';
import { PortalContext } from '../../../../PortalContext';
import { IArmResourceTemplate } from '../../../../utils/ArmTemplateHelper';
import { CommonConstants } from '../../../../utils/CommonConstants';
import { getDeploymentTemplate } from '../../../../utils/CosmosDbArmTemplateHelper';
import { Guid } from '../../../../utils/Guid';
import { LogCategories } from '../../../../utils/LogCategories';
import LogService from '../../../../utils/LogService';
import { CreateFunctionFormValues } from '../common/CreateFunctionFormBuilder';
import { useAppSettingsQuery } from '../common/useAppSettingsQuery';
import { usePermissions } from '../common/usePermissions';
import FunctionCreateData from './FunctionCreate.data';

export const useCreateFunction = (
  armResources: IArmResourceTemplate[],
  resourceId: string,
  setCreatingFunction: React.Dispatch<React.SetStateAction<boolean>>,
  hostStatus?: ArmObj<HostStatus>,
  selectedTemplate?: FunctionTemplate
) => {
  const portalCommunicator = useContext(PortalContext);
  const { hasResourceGroupWritePermission, hasSubscriptionWritePermission } = usePermissions(resourceId);
  const { t } = useTranslation();
  const { appSettings } = useAppSettingsQuery(resourceId);

  const updateAppSettings = useCallback(
    (appSettings: ArmObj<Record<string, string>>) => {
      const notificationId = portalCommunicator.startNotification(t('configUpdating'), t('configUpdating'));

      FunctionCreateData.updateAppSettings(resourceId, appSettings).then(response => {
        if (response.metadata.success) {
          portalCommunicator.stopNotification(notificationId, true, t('configUpdateSuccess'));
        } else {
          portalCommunicator.stopNotification(notificationId, false, getErrorMessage(response.metadata.error) || t('configUpdateFailure'));

          LogService.trackEvent(
            LogCategories.localDevExperience,
            'updateAppSettings',
            `Failed to update Application Settings: ${getErrorMessageOrStringify(response.metadata.error)}`
          );
        }
      });
    },
    [portalCommunicator, resourceId, t]
  );

  const createFunction = useCallback(
    (formValues?: CreateFunctionFormValues) => {
      if (!!appSettings && !!formValues && !!selectedTemplate) {
        setCreatingFunction(true);

        // NOTE(nlayne): Handle manual Cosmos DB configuration by adding a custom app setting for the connection string.
        let newAppSettings = formValues.newAppSettings;
        if (formValues.connectionType === 'manual') {
          formValues.connectionStringSetting = formValues.customAppSettingKey;

          newAppSettings = {
            properties: {
              [formValues.customAppSettingKey]: formValues.customAppSettingValue,
            },
          };
        }

        // NOTE(nlayne): Users without write permissions must use the REST API instead of deployments for app settings.
        if (!hasSubscriptionWritePermission || !hasResourceGroupWritePermission) {
          if (newAppSettings) {
            updateAppSettings(newAppSettings);
          }

          newAppSettings = undefined;
        }

        const config = FunctionCreateData.buildFunctionConfig(selectedTemplate.bindings ?? [], formValues);
        const deploymentName = `Microsoft.Web-Function-${Guid.newShortGuid()}`;
        const { files } = selectedTemplate;
        const { functionName } = formValues;

        LogService.trackEvent(
          LogCategories.localDevExperience,
          'FunctionCreateClicked',
          FunctionCreateData.getDataForTelemetry(resourceId, functionName, selectedTemplate, hostStatus)
        );

        // NOTE(nlayne): Only do deployment stuff if we have resources or new app settings to deploy.
        if (!!newAppSettings || armResources.length > 0) {
          // Include the current app settings in the deployment else they will be overwritten.
          const splitResourceId = resourceId.split('/');
          const functionAppId = splitResourceId[splitResourceId.length - 1];
          const armDeploymentTemplate = getDeploymentTemplate(armResources, functionAppId, newAppSettings, appSettings.properties);

          // Double-check that we don't do a deployment without resources.
          const count = armDeploymentTemplate.properties.template.resources.length;
          if (count > 0) {
            // Hand ARM deployment template to Ibiza to do deployment and notifications.
            const resourceIdFragment = resourceId.toLowerCase().split('/microsoft.web')[0];
            const resourceGroup = resourceIdFragment.split('resourcegroups/')[1]?.split('/')[0];
            const uri = `${resourceIdFragment}/Microsoft.Resources/deployments/${deploymentName}?api-version=${CommonConstants.ApiVersions.armDeploymentApiVersion20210401}`;
            portalCommunicator
              .executeArmUpdateRequest({
                uri,
                type: 'PUT',
                content: armDeploymentTemplate,
                notificationTitle: t('createFunctionDeploymentNotification'),
                notificationDescription: t('createFunctionDeploymentNotificationDetails').format(functionName),
                notificationSuccessDescription: t('createFunctionDeploymentNotificationSuccess').format(deploymentName, resourceGroup),
                notificationFailureDescription: t('createFunctionDeploymentNotificationFailed').format(deploymentName, resourceGroup),
              })
              .then(response => {
                if (response.isSuccessful) {
                  LogService.trackEvent(
                    LogCategories.functionCreate,
                    'ResourceDeploymentSucceeded',
                    `Deployment of ${count} resources with function creation succeeded`
                  );
                } else {
                  const errorMessage = getErrorMessageOrStringify(response.error);
                  LogService.trackEvent(
                    LogCategories.functionCreate,
                    'ResourceDeploymentFailed',
                    `Deployment of ${count} resources with function creation failed: ${errorMessage}`
                  );
                }
              });
          }
        }

        const notificationId = portalCommunicator.startNotification(
          t('createFunctionNotication'),
          t('createFunctionNotificationDetails').format(functionName)
        );

        FunctionCreateData.createFunction(resourceId, functionName, files, config).then(response => {
          if (response.metadata.success) {
            LogService.trackEvent(
              LogCategories.localDevExperience,
              'FunctionCreateSucceeded',
              FunctionCreateData.getDataForTelemetry(resourceId, functionName, selectedTemplate, hostStatus)
            );

            portalCommunicator.stopNotification(notificationId, true, t('createFunctionNotificationSuccess').format(functionName));
            portalCommunicator.closeSelf(`${resourceId}/functions/${functionName}`);
          } else {
            LogService.trackEvent(
              LogCategories.localDevExperience,
              'createFunction',
              `Failed to create function ${getErrorMessageOrStringify(response.metadata.error)}`
            );

            const errorMessage = getErrorMessage(response.metadata.error);
            portalCommunicator.stopNotification(
              notificationId,
              false,
              errorMessage
                ? t('createFunctionNotificationFailedDetails').format(functionName, errorMessage)
                : t('createFunctionNotificationFailed').format(functionName)
            );
            portalCommunicator.closeSelf();
          }
        });
      }
    },
    [
      appSettings,
      armResources,
      hasResourceGroupWritePermission,
      hasSubscriptionWritePermission,
      hostStatus,
      portalCommunicator,
      resourceId,
      selectedTemplate,
      setCreatingFunction,
      t,
      updateAppSettings,
    ]
  );

  return createFunction;
};
