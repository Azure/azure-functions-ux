export interface MinorVersion {
  displayVersion: string;
  runtimeVersion: string;
  isDefault: boolean;
  isRemoteDebuggingEnabled: boolean;
  isEndOfLife?: boolean;
  isAutoUpdate?: boolean;
}

export interface MajorVersion {
  displayVersion: string;
  runtimeVersion: string;
  isDefault: boolean;
  minorVersions: MinorVersion[];
  applicationInsights: boolean;
  isEndOfLife?: boolean;
  allMinorVersionsEndOfLife?: boolean;
}

export interface MinorVersion2 {
  displayVersion: string;
  runtimeVersion: string;
  isDefault: boolean;
  isAutoUpdate?: boolean;
}

export interface MajorVersion2 {
  displayVersion: string;
  runtimeVersion: string;
  isDefault: boolean;
  minorVersions: MinorVersion2[];
}

export interface Framework {
  name: string;
  display: string;
  dependency?: any;
  majorVersions: MajorVersion2[];
  frameworks?: any;
}

export interface AvailableStack {
  name: string;
  display: string;
  dependency?: string;
  majorVersions: MajorVersion[];
  frameworks: Framework[];
}
