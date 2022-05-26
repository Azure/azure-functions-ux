export interface LogEntry {
  level: LogLevel;
  message: string;
}

export interface LogsEnabled {
  applicationLogs: boolean;
  webServerLogs: boolean;
}

export enum LogLevel {
  Unknown = -1,
  Normal = 1,
  Info = 2,
  Error = 3,
  Warning = 4,
}

export enum LogType {
  Application = 'application',
  WebServer = 'webserver',
}

export const newLine = '\n';
export const maxLogEntries = 1000;

export class LogRegex {
  public static readonly infoLog: RegExp = /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2}:\d{2}\.\d+) (\[Info|INFO|\[INFO)/;
  public static readonly infoLogUTC: RegExp = /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2}:\d{2}\.\d+)(\Z|Z:) (\[Info|INFO|\[INFO)/;
  public static readonly errorLog: RegExp = /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2}:\d{2}\.\d+) (\[Error|ERROR|\[ERROR)/;
  public static readonly errorLogUTC: RegExp = /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2}:\d{2}\.\d+)(\Z|Z:) (\[Error|ERROR|\[ERROR)/;
  public static readonly warningLog: RegExp = /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2}:\d{2}\.\d+) (\[Warning|WARNING|\[WARNING)/;
  public static readonly warningLogUTC: RegExp = /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2}:\d{2}\.\d+)(\Z|Z:) (\[Warning|WARNING|\[WARNING)/;
  public static readonly log: RegExp = /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2}:\d{2})/;
}
