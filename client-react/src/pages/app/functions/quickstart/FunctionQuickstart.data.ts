import FunctionsService from '../../../../ApiHelpers/FunctionsService';
import SiteService from '../../../../ApiHelpers/SiteService';

export default class FunctionQuickstartData {
  public getQuickstartFilename(filename: string) {
    return FunctionsService.getQuickStartFile(filename);
  }

  public fetchApplicationSettings(resourceId: string) {
    return SiteService.fetchApplicationSettings(resourceId);
  }
}
