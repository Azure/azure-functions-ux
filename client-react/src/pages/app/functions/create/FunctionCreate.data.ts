import { FunctionTemplate } from '../../../../models/functions/function-template';
import { BindingInfo } from '../../../../models/functions/function-binding';
import { CreateFunctionFormValues } from '../common/CreateFunctionFormBuilder';
import FunctionsService from '../../../../ApiHelpers/FunctionsService';
import { BindingEditorFormValues } from '../common/BindingFormBuilder';
import { FunctionConfig } from '../../../../models/functions/function-config';
import PortalCommunicator from '../../../../portal-communicator';
import i18next from 'i18next';

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
    const config = this._buildFunctionConfig(functionTemplate.function.bindings, formValues);
    const notificationId = portalCommunicator.startNotification(t('newFunction'), t('newFunction'));

    FunctionsService.createFunction(resourceId, formValues.functionName, functionTemplate.files, config).then(r => {
      if (!r.metadata.success) {
        const errorMessage = r.metadata.error ? r.metadata.error.Message : '';
        portalCommunicator.stopNotification(notificationId, false, errorMessage);
        return;
      }

      portalCommunicator.stopNotification(notificationId, true, formValues.functionName);
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
