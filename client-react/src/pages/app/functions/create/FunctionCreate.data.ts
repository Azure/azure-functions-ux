import { FunctionTemplate } from '../../../../models/functions/function-template';
import { BindingInfo } from '../../../../models/functions/function-binding';
import { CreateFunctionFormValues } from '../common/CreateFunctionFormBuilder';
import FunctionsService from '../../../../ApiHelpers/FunctionsService';
import { BindingEditorFormValues } from '../common/BindingFormBuilder';
import { FunctionConfig } from '../../../../models/functions/function-config';
import PortalCommunicator from '../../../../portal-communicator';
import i18next from 'i18next';
import { ArmObj } from '../../../../models/arm-obj';
import SiteService from '../../../../ApiHelpers/SiteService';
import { KeyValue } from '../../../../models/portal-models';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';
import Url from '../../../../utils/url';
import { HostStatus } from '../../../../models/functions/host-status';

export default class FunctionCreateData {
  public getHostStatus(resourceId: string) {
    return FunctionsService.getHostStatus(resourceId);
  }

  public getTemplates(resourceId: string) {
    return FunctionsService.getTemplates(resourceId);
  }

  public getFunctions(resourceId: string) {
    return FunctionsService.getFunctions(resourceId);
  }

  public getBinding(resourceId: string, bindingId: string) {
    return FunctionsService.getBinding(resourceId, bindingId);
  }

  public createFunction(
    portalCommunicator: PortalCommunicator,
    t: i18next.TFunction,
    resourceId: string,
    functionTemplate: FunctionTemplate,
    formValues: CreateFunctionFormValues,
    hostStatus: HostStatus
  ) {
    if (formValues.newAppSettings) {
      this._updateAppSettings(portalCommunicator, t, resourceId, formValues.newAppSettings);
    }
    const config = this._buildFunctionConfig(functionTemplate.bindings || [], formValues);
    this._createNewFunction(portalCommunicator, t, resourceId, formValues.functionName, functionTemplate, config, hostStatus);
  }

  private _createNewFunction(
    portalCommunicator: PortalCommunicator,
    t: i18next.TFunction,
    resourceId: string,
    functionName: string,
    functionTemplate: FunctionTemplate,
    functionConfig: FunctionConfig,
    hostStatus: HostStatus
  ) {
    const notificationId = portalCommunicator.startNotification(
      t('createFunctionNotication'),
      t('createFunctionNotificationDetails').format(functionName)
    );

    FunctionsService.createFunction(resourceId, functionName, functionTemplate.files, functionConfig).then(r => {
      LogService.trackEvent(
        LogCategories.functionCreate,
        'FunctionCreateClicked',
        this._getDataForTelemetry(resourceId, functionName, functionTemplate, hostStatus)
      );

      if (!r.metadata.success) {
        const errorMessage = getErrorMessage(r.metadata.error);
        portalCommunicator.stopNotification(
          notificationId,
          false,
          errorMessage
            ? t('createFunctionNotificationFailedDetails').format(functionName, errorMessage)
            : t('createFunctionNotificationFailed').format(functionName)
        );
        portalCommunicator.closeSelf();
      } else {
        LogService.trackEvent(
          LogCategories.functionCreate,
          'FunctionCreateSucceeded',
          this._getDataForTelemetry(resourceId, functionName, functionTemplate, hostStatus)
        );
        portalCommunicator.stopNotification(notificationId, true, t('createFunctionNotificationSuccess').format(functionName));
        const id = `${resourceId}/functions/${functionName}`;
        portalCommunicator.closeSelf(id);
      }
    });
  }

  private _getDataForTelemetry(resourceId: string, functionName: string, functionTemplate: FunctionTemplate, hostStatus: HostStatus) {
    return {
      resourceId,
      functionName,
      language: functionTemplate.language,
      category: functionTemplate.category,
      functionTemplateId: functionTemplate.id,
      extensionBundle: hostStatus.extensionBundle,
      runtimeVersion: hostStatus.version,
      sessionId: Url.getParameterByName(null, 'sessionId'),
    };
  }

  private _updateAppSettings(
    portalCommunicator: PortalCommunicator,
    t: i18next.TFunction,
    resourceId: string,
    appSettings: ArmObj<KeyValue<string>>
  ) {
    const notificationId = portalCommunicator.startNotification(t('configUpdating'), t('configUpdating'));

    SiteService.updateApplicationSettings(resourceId, appSettings).then(r => {
      if (!r.metadata.success) {
        const errorMessage = getErrorMessage(r.metadata.error) || t('configUpdateFailure');
        portalCommunicator.stopNotification(notificationId, false, errorMessage);
        return;
      }

      portalCommunicator.stopNotification(notificationId, true, t('configUpdateSuccess'));
    });
  }

  private _buildFunctionConfig(defaultBindingInfo: BindingInfo[], formValues: BindingEditorFormValues): FunctionConfig {
    const resultConfig: FunctionConfig = {
      bindings: [],
    };

    defaultBindingInfo.forEach(bindingInfo => {
      const bindingInfoCopy = { ...bindingInfo };
      // Update binding values that exist in the form
      for (const key in bindingInfo) {
        if (formValues.hasOwnProperty(key)) {
          bindingInfoCopy[key] = formValues[key];
        }
      }
      resultConfig.bindings.push(bindingInfoCopy);
    });

    return resultConfig;
  }
}
