import ContainerLogsService from '../../../ApiHelpers/ContainerLogsService';
import { ArmObj } from '../../../models/arm-obj';
import { PublishingUser } from '../../../models/site/publish';
import ProviderService from '../../../ApiHelpers/ProviderService';
import SiteService from '../../../ApiHelpers/SiteService';

export default class DeploymentCenterData {
  public fetchContainerLogs = (resourceId: string) => {
    return ContainerLogsService.fetchContainerLogs(resourceId);
  };

  public getPublishingUser = () => {
    return ProviderService.getPublishingUser();
  };

  public updatePublishingUser = (user: ArmObj<PublishingUser>) => {
    return ProviderService.updatePublishingUser(user);
  };

  public getPublishingCredentials = (resourceId: string) => {
    return SiteService.getPublishingCredentials(resourceId);
  };

  public getPublishProfile = (resourceId: string) => {
    return SiteService.getPublishProfile(resourceId);
  };

  public resetPublishProfile = (resourceId: string) => {
    return SiteService.resetPublishProfile(resourceId);
  };

  public getSiteConfig = (resourceId: string) => {
    return SiteService.fetchWebConfig(resourceId);
  };

  public fetchApplicationSettings = (resourceId: string) => {
    return SiteService.fetchApplicationSettings(resourceId);
  };
}
