import FunctionsService from '../../../../ApiHelpers/FunctionsService';

export default class FunctionCreateData {
  public static getTemplates(resourceId: string) {
    return FunctionsService.getTemplates(resourceId);
  }
}
