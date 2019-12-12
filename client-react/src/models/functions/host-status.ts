export enum HostStates {
  default = 'Default',
  initialized = 'Initialized',
  running = 'Running',
  error = 'Error',
  offline = 'Offline',
}

export interface HostStatus {
  id: string;
  version: string;
  state: HostStates;
  errors?: string[];
}
