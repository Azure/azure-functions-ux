import { getErrorMessageOrStringify } from '../ApiHelpers/ArmHelper';
import { DataMessageStatus, IDataMessageResult } from '../models/portal-models';
import { LogFunction } from './hooks/usePortalLogging';
import { getTelemetryInfo } from './TelemetryUtils';

export function isPortalCommunicationStatusSuccess(status: DataMessageStatus) {
  return status === 'success';
}

export function getJQXHR(data: IDataMessageResult<any>, logCategory: string, id: string, log?: LogFunction) {
  const result = data.result;
  if (isPortalCommunicationStatusSuccess(data.status)) {
    return result.jqXHR;
  } else {
    try {
      const parsedResult = JSON.parse(result);
      return parsedResult.jqXHR;
    } catch (error) {
      log?.(getTelemetryInfo('error', logCategory, id, { message: `JSON Parsing failed for: ${getErrorMessageOrStringify(error)}` }));
      return undefined;
    }
  }
}
