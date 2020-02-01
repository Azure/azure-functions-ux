import FunctionsService from '../../../../ApiHelpers/FunctionsService';
import SiteService from '../../../../ApiHelpers/SiteService';

export default class FunctionQuickstartData {
  public getQuickstartFile(filename: string, language: string) {
    return FunctionsService.getQuickStartFile(filename, language);
  }

  public fetchApplicationSettings(resourceId: string) {
    return SiteService.fetchApplicationSettings(resourceId);
  }
}
