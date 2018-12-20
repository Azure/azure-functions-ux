import { ArmObj, Site } from '../../../models/WebAppModels';

export interface LogStreamValues {
  site: ArmObj<Site>;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
}

export enum LogLevel {
  Unknown,
  Normal,
  Info,
  Error,
  Warning,
}

export enum LogTypes {
  Application = 'application',
  WebServer = 'webserver',
}

export const timerInterval: number = 1000;
export const newLine: string = '\n';
export const maxLogEntries: number = 1000;

export class LogRegex {
  public static readonly infoLog: RegExp = /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2}:\d{2}\.\d+)\ (\[Info|INFO)/;
  public static readonly errorLog: RegExp = /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2}:\d{2}\.\d+)\ (\[Error|ERROR)/;
  public static readonly warningLog: RegExp = /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2}:\d{2}\.\d+)\ (\[Warning|WARNING)/;
  public static readonly log: RegExp = /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2}:\d{2})/;
}
