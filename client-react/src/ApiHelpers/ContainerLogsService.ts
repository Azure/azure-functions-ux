import MakeArmCall from './ArmHelper';

export default class ContainerLogsService {
  public static fetchContainerLogs = (resourceId: string) => {
    const id = `${resourceId}/containerlogs`;

    // NOTE(michinoy): Do not batch this call as it does not return application/json response.
    return MakeArmCall<string>({
      resourceId: id,
      commandName: 'fetchContainerLogs',
      method: 'POST',
      skipBatching: true,
    });
  };
}
