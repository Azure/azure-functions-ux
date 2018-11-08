import { ArmObj, Site } from '../../../models/WebAppModels';

export interface LogStreamValues {
  site: ArmObj<Site>;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
}

export enum LogLevel {
  Unknown = -1,
  Normal = 1,
  Info = 2,
  Error = 3,
  Warning = 4,
}
