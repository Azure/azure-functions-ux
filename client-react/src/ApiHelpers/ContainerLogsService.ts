import MakeArmCall from './ArmHelper';

export default class ContainerLogsService {
  public static fetchContainerLogs = (resourceId: string) => {
    const id = `${resourceId}/containerlogs`;

    return MakeArmCall<string>({
      resourceId: id,
      commandName: 'fetchContainerLogs',
      method: 'POST',
    });
  };
}
