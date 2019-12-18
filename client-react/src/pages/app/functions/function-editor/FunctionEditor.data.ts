import FunctionsService from '../../../../ApiHelpers/FunctionsService';

export default class FunctionEditorData {
  public getFunctionInfo(resourceId: string) {
    return FunctionsService.getFunction(resourceId);
  }
}
