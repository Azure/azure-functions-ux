import FunctionsService from '../../../../ApiHelpers/FunctionsService';

export default class FunctionQuickstartData {
  public getQuickstartFilename(filename: string) {
    return FunctionsService.getQuickStartFile(filename);
  }
}
