import FunctionsService from '../../../../ApiHelpers/FunctionsService';

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
}
