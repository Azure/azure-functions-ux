import { getErrorMessageOrStringify } from '../ApiHelpers/ArmHelper';
import { DataMessageStatus, IDataMessageResult } from '../models/portal-models';

import LogService from './LogService';

export function isPortalCommunicationStatusSuccess(status: DataMessageStatus) {
  return status === 'success';
}

export function getJQXHR(data: IDataMessageResult<any>, logCategory: string, id: string) {
  const result = data.result;
  if (isPortalCommunicationStatusSuccess(data.status)) {
    return result.jqXHR;
  } else {
    try {
      const parsedResult = JSON.parse(result);
      return parsedResult.jqXHR;
    } catch (err) {
      LogService.error(logCategory, id, `JSON Parsing failed for: ${getErrorMessageOrStringify(err)}`);
      return undefined;
    }
  }
}
