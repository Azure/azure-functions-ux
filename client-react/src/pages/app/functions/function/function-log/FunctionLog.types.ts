export enum LogLevel {
  Verbose,
  Information,
  Warning,
  Error,
}

export interface LogEntry {
  message: string;
  color: string;
  level: LogLevel;
}
