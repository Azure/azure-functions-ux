import { Injectable } from '@angular/core';

export enum LogLevel {
  error,
  warning,
  debug,
  verbose,
}

@Injectable()
export class MockLogService {
  constructor() {}

  public error(category: string, id: string, data: any) {}

  public warn(category: string, id: string, data: any) {}

  public debug(category: string, data: any) {}

  public verbose(category: string, data: any) {}

  public log(level: LogLevel, category: string, data: any, id?: string) {}
}
