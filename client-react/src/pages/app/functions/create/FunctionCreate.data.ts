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

export default class FunctionCreateData {
  public getTemplates() {
    return FunctionsService.getTemplatesMetadata();
  }

  public getFunctions(resourceId: string) {
    return FunctionsService.getFunctions(resourceId);
  }

  public getBindings() {
    return FunctionsService.getBindingConfigMetadata();
  }

  public createFunction(
    portalCommunicator: PortalCommunicator,
    t: i18next.TFunction,
    resourceId: string,
    functionTemplate: FunctionTemplate,
    formValues: CreateFunctionFormValues
  ) {
    if (formValues.newAppSettings) {
      this._updateAppSettings(portalCommunicator, t, resourceId, formValues.newAppSettings);
    }
    const config = this._buildFunctionConfig(functionTemplate.function.bindings, formValues);
    this._createNewFunction(portalCommunicator, t, resourceId, formValues.functionName, functionTemplate.files, config);
  }

  private _createNewFunction(
    portalCommunicator: PortalCommunicator,
    t: i18next.TFunction,
    resourceId: string,
    functionName: string,
    functionFiles: any,
    functionConfig: FunctionConfig
  ) {
    const notificationId = portalCommunicator.startNotification(
      t('createFunctionNotication'),
      t('createFunctionNotificationDetails').format(functionName)
    );

    FunctionsService.createFunction(resourceId, functionName, functionFiles, functionConfig).then(r => {
      if (!r.metadata.success) {
        const errorMessage = r.metadata.error ? r.metadata.error.Message : '';
        portalCommunicator.stopNotification(
          notificationId,
          false,
          t('createFunctionNotificationFailed').format(functionName, errorMessage)
        );
        portalCommunicator.closeSelf();
      } else {
        portalCommunicator.stopNotification(notificationId, true, t('createFunctionNotificationSuccess').format(functionName));
        const id = `${resourceId}/functions/${functionName}`;
        portalCommunicator.closeSelf(id);
      }
    });
  }

  private _updateAppSettings(
    portalCommunicator: PortalCommunicator,
    t: i18next.TFunction,
    resourceId: string,
    appSettings: ArmObj<{ [key: string]: string }>
  ) {
    const notificationId = portalCommunicator.startNotification(t('configUpdating'), t('configUpdating'));

    SiteService.updateApplicationSettings(resourceId, appSettings).then(r => {
      if (!r.metadata.success) {
        const errorMessage = r.metadata.error ? r.metadata.error.Message : t('configUpdateFailure');
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
