import ContainerLogsService from '../../../ApiHelpers/ContainerLogsService';

export default class DeploymentCenterData {
  public fetchContainerLogs = (resourceId: string) => {
    return ContainerLogsService.fetchContainerLogs(resourceId);
  };
}
