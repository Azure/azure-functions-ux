import { HostSyncStatus } from './constants';

export interface SyncStatus {
  status: HostSyncStatus;
  errors?: string[];
}
