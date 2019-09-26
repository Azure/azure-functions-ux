import SiteService from '../../ApiHelpers/SiteService';

export class SiteRouterData {
  public fetchSite = (resourceId: string) => {
    return SiteService.fetchSite(resourceId);
  };
}
