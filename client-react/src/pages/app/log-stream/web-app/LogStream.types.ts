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

export const newLine: string = '\n';
export const maxLogEntries: number = 1000;

export class LogRegex {
  // eslint-disable-next-line no-useless-escape
  public static readonly infoLog: RegExp = /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2}:\d{2}\.\d+)\ (\[Info|INFO)/;

  // eslint-disable-next-line no-useless-escape
  public static readonly errorLog: RegExp = /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2}:\d{2}\.\d+)\ (\[Error|ERROR)/;

  // eslint-disable-next-line no-useless-escape
  public static readonly warningLog: RegExp = /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2}:\d{2}\.\d+)\ (\[Warning|WARNING)/;
  public static readonly log: RegExp = /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2}:\d{2})/;
}
