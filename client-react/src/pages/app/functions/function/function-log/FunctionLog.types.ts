export enum LogLevel {
  Verbose,
  Information,
  Warning,
  Error,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
}
