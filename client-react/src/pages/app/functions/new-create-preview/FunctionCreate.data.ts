import FunctionsService from '../../../../ApiHelpers/FunctionsService';
import { BindingInfo } from '../../../../models/functions/function-binding';
import { BindingEditorFormValues } from '../common/BindingFormBuilder';
import { FunctionConfig } from '../../../../models/functions/function-config';
import { ArmObj } from '../../../../models/arm-obj';
import { KeyValue } from '../../../../models/portal-models';
import SiteService from '../../../../ApiHelpers/SiteService';
import { FunctionTemplate } from '../../../../models/functions/function-template';
import { HostStatus } from '../../../../models/functions/host-status';
import Url from '../../../../utils/url';

export default class FunctionCreateData {
  public static getTemplates(resourceId: string) {
    return FunctionsService.getTemplates(resourceId);
  }

  public static getBinding(resourceId: string, bindingId: string) {
    return FunctionsService.getBinding(resourceId, bindingId);
  }

  public static getLocalDevExperienceInstructions(filename: string, language: string) {
    return FunctionsService.getQuickStartFile(filename, language);
  }

  public static buildFunctionConfig(defaultBindingInfo: BindingInfo[], formValues: BindingEditorFormValues): FunctionConfig {
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

  public static updateAppSettings(resourceId: string, appSettings: ArmObj<KeyValue<string>>) {
    return SiteService.updateApplicationSettings(resourceId, appSettings);
  }

  public static createFunction(functionAppId: string, functionName: string, files: KeyValue<string>, functionConfig: FunctionConfig) {
    return FunctionsService.createFunction(functionAppId, functionName, files, functionConfig);
  }

  public static getHostStatus(resourceId: string) {
    return FunctionsService.getHostStatus(resourceId);
  }

  public static getDataForTelemetry(
    resourceId: string,
    functionName: string,
    functionTemplate: FunctionTemplate,
    hostStatus?: ArmObj<HostStatus>
  ) {
    return {
      resourceId,
      functionName,
      language: functionTemplate.language,
      category: functionTemplate.category,
      functionTemplateId: functionTemplate.id,
      extensionBundle: hostStatus ? hostStatus.properties.extensionBundle : '',
      runtimeVersion: hostStatus ? hostStatus.properties.version : '',
      sessionId: Url.getParameterByName(null, 'sessionId'),
    };
  }
}
