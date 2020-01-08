export enum HostStates {
  default = 'Default',
  initialized = 'Initialized',
  running = 'Running',
  error = 'Error',
  offline = 'Offline',
}

export interface HostStatus {
  id: string;
  state: HostStates;
  version: string;
  verionDetails?: string[];
  errors?: string[];
}
