import { MessageBarType } from '@fluentui/react';
import { useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import { StatusMessage } from '../../../../components/ActionBar';
import { ArmObj } from '../../../../models/arm-obj';
import { FunctionTemplate } from '../../../../models/functions/function-template';
import { HostStatus } from '../../../../models/functions/host-status';
import { PortalContext } from '../../../../PortalContext';
import { IArmResourceTemplate } from '../../../../utils/ArmTemplateHelper';
import { CommonConstants } from '../../../../utils/CommonConstants';
import { getDeploymentTemplate } from '../../../../utils/CosmosDbArmTemplateHelper';
import { Guid } from '../../../../utils/Guid';
import { LogCategories } from '../../../../utils/LogCategories';
import { CreateFunctionFormValues } from '../common/CreateFunctionFormBuilder';
import { getTelemetryInfo } from '../common/FunctionsUtility';
import { COSMOS_DB_TRIGGER } from '../common/BindingTypeRegex';
import { usePermissions } from '../common/usePermissions';
import FunctionCreateData from './FunctionCreate.data';

export const useCreateFunction = (
  appSettings: ArmObj<Record<string, string>> | undefined,
  armResources: IArmResourceTemplate[],
  resourceId: string,
  setCreatingFunction: React.Dispatch<React.SetStateAction<boolean>>,
  hostStatus?: ArmObj<HostStatus>,
  selectedTemplate?: FunctionTemplate
) => {
  const portalCommunicator = useContext(PortalContext);
  const [createExperienceStatusMessage, setCreateExperienceStatusMessage] = useState<StatusMessage>();
  const { hasAppSettingsPermissions, hasResourceGroupWritePermission, hasSubscriptionWritePermission } = usePermissions(resourceId);
  const { t } = useTranslation();

  const updateAppSettings = useCallback(
    (settings: Partial<ArmObj<Record<string, string>>>) => {
      const notificationId = portalCommunicator.startNotification(t('configUpdating'), t('configUpdating'));

      FunctionCreateData.updateAppSettings(resourceId, settings).then(response => {
        if (response.metadata.success) {
          portalCommunicator.stopNotification(notificationId, true, t('configUpdateSuccess'));
        } else {
          portalCommunicator.stopNotification(notificationId, false, getErrorMessage(response.metadata.error) || t('configUpdateFailure'));
          portalCommunicator.log(
            getTelemetryInfo('info', LogCategories.localDevExperience, 'updateAppSettings', {
              errorAsString: response.metadata.error ? JSON.stringify(response.metadata.error) : '',
              message: getErrorMessage(response.metadata.error),
            })
          );
        }
      });
    },
    [portalCommunicator, resourceId, t]
  );

  const createFunction = useCallback(
    (formValues?: CreateFunctionFormValues) => {
      if (!!appSettings && !!formValues && !!selectedTemplate) {
        if (!resourceId) {
          setCreateExperienceStatusMessage({
            level: MessageBarType.error,
            message: t('createFunction_noResourceIdError'),
          });
          return;
        }

        setCreatingFunction(true);

        /** @note (joechung): Record telemetry for Cosmos DB function creates. */
        if (COSMOS_DB_TRIGGER.test(selectedTemplate.id)) {
          portalCommunicator.log(
            getTelemetryInfo('info', 'cosmos-db-create-function', 'start-create', {
              connectionType: formValues.connectionType,
              count: String(armResources.length),
              customAppSettingKeyAdded: String(!!formValues.customAppSettingKey),
            })
          );
        }

        // NOTE(nlayne): Handle manual Cosmos DB configuration by adding a custom app setting for the connection string.
        let newAppSettings = formValues.newAppSettings;
        if (formValues.connectionType === 'manual') {
          formValues.connectionStringSetting = formValues.customAppSettingKey;

          newAppSettings = {
            properties: {
              ...appSettings?.properties,
              [formValues.customAppSettingKey]: formValues.customAppSettingValue,
            },
          };
        }

        // NOTE(nlayne): Users without write permissions must use the REST API instead of deployments for app settings.
        if (!hasSubscriptionWritePermission || !hasResourceGroupWritePermission) {
          if (newAppSettings) {
            if (!hasAppSettingsPermissions) {
              setCreatingFunction(false);
              setCreateExperienceStatusMessage({
                level: MessageBarType.error,
                message: t('createFunction_noAppSettingsPermissionsError'),
              });
              return;
            }

            updateAppSettings({
              properties: {
                ...appSettings?.properties,
                ...newAppSettings?.properties,
              },
            });
          }

          newAppSettings = undefined;
        }

        const config = FunctionCreateData.buildFunctionConfig(selectedTemplate.bindings ?? [], formValues);
        const deploymentName = `Microsoft.Web-Function-${Guid.newShortGuid()}`;
        const { files } = selectedTemplate;
        const { functionName } = formValues;

        portalCommunicator.log(
          getTelemetryInfo(
            'info',
            LogCategories.localDevExperience,
            'FunctionCreateClicked',
            FunctionCreateData.getDataForTelemetry(resourceId, functionName, selectedTemplate, hostStatus)
          )
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
                  portalCommunicator.log(
                    getTelemetryInfo('info', LogCategories.functionCreate, 'ResourceDeploymentSucceeded', {
                      message: `Deployment of ${count} resources with function creation succeeded`,
                    })
                  );
                  portalCommunicator.log(
                    getTelemetryInfo('info', 'cosmos-db-create-function', 'succeeded', {
                      existing: String(armResources.length > 0),
                    })
                  );
                } else {
                  portalCommunicator.log(
                    getTelemetryInfo('info', LogCategories.functionCreate, 'ResourceDeploymentFailed', {
                      errorAsString: response.error ? JSON.stringify(response.error) : '',
                      message: getErrorMessage(response.error),
                    })
                  );
                  portalCommunicator.log(
                    getTelemetryInfo('info', 'cosmos-db-create-function', 'failed', {
                      existing: String(armResources.length > 0),
                    })
                  );
                }
              });
          }
        }

        const notificationId = portalCommunicator.startNotification(
          t('createFunctionNotification'),
          t('createFunctionNotificationDetails').format(functionName)
        );

        FunctionCreateData.createFunction(resourceId, functionName, files, config).then(response => {
          if (response.metadata.success) {
            portalCommunicator.log(
              getTelemetryInfo(
                'info',
                LogCategories.localDevExperience,
                'FunctionCreateSucceeded',
                FunctionCreateData.getDataForTelemetry(resourceId, functionName, selectedTemplate, hostStatus)
              )
            );

            portalCommunicator.stopNotification(notificationId, true, t('createFunctionNotificationSuccess').format(functionName));
            portalCommunicator.closeSelf(`${resourceId}/functions/${functionName}`);
          } else {
            portalCommunicator.log(
              getTelemetryInfo('info', LogCategories.localDevExperience, 'createFunction', {
                errorAsString: response.metadata.error ? JSON.stringify(response.metadata.error) : '',
                message: getErrorMessage(response.metadata.error),
              })
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
      hasAppSettingsPermissions,
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

  return {
    createExperienceStatusMessage,
    createFunction,
  };
};
