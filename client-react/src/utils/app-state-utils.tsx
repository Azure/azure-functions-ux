import { getErrorMessageOrStringify } from '../ApiHelpers/ArmHelper';
import FunctionsService from '../ApiHelpers/FunctionsService';
import { ArmObj } from '../models/arm-obj';
import { HostStatus, FunctionAppContentEditingState } from '../models/functions/host-status';
import { FunctionAppEditMode } from '../models/portal-models';
import LogService from './LogService';

export async function fetchAndResolveStateFromHostStatus(
  trimmedResourceId: string,
  logCategory: string
): Promise<FunctionAppEditMode | undefined> {
  const hostStatus = await FunctionsService.getHostStatus(trimmedResourceId);
  if (hostStatus.metadata.success) {
    return resolveStateFromFunctionHostStatus(hostStatus.data);
  } else {
    LogService.error(
      logCategory,
      'getHostStatus',
      `Failed to get function host status: ${getErrorMessageOrStringify(hostStatus.metadata.error)}`
    );
    return undefined;
  }
}

const resolveStateFromFunctionHostStatus = (hostStatus: ArmObj<HostStatus>): FunctionAppEditMode | undefined => {
  if (hostStatus.properties.functionAppContentEditingState === FunctionAppContentEditingState.NotAllowed) {
    return FunctionAppEditMode.ReadOnlyAzureFiles;
  }

  return undefined;
};
