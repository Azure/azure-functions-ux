import { DataMessageStatus } from '../models/portal-models';

export function isPortalCommunicationStatusSuccess(status: DataMessageStatus) {
  return status === 'success';
}
