export enum HostStates {
  default = 'Default',
  initialized = 'Initialized',
  running = 'Running',
  error = 'Error',
  offline = 'Offline',
}

export interface ExtensionBundle {
  id?: string;
  version?: string;
}

export interface HostStatus {
  id: string;
  state: HostStates;
  version: string;
  versionDetails?: string[];
  errors?: string[];
  extensionBundle?: ExtensionBundle;
}
