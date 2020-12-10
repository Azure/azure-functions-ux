import { spawn } from 'child_process';
import { existsSync } from 'fs';

export enum EventType {
  Info = 'Info',
  Warning = 'Warning',
  Error = 'Error',
  Debug = 'Debug',
  Metric = 'Metric',
}

export class EtwService {
  private _ipc: any;

  constructor() {
    try {
      const etwLoggerPathFallback = process.env.WEBSITE_SITE_NAME
        ? './EtwLogger/EtwLogger.exe'
        : '../EtwLogger/bin/Release/netcoreapp3.1/EtwLogger.exe';
      const etwLoggerPath = process.env.etwLoggerPath || etwLoggerPathFallback;

      if (!existsSync(etwLoggerPath)) {
        console.log(`EtwLogger.exe does not exist at ${etwLoggerPath}`);
        return;
      }

      const etwLoggerProviderName = process.env.etwLoggerProviderName || 'AppServiceUxServerLogs';

      this._ipc = spawn(etwLoggerPath, [etwLoggerProviderName]);

      this._ipc.on('error', error => {
        // To avoid infinite loop, only log to console.
        console.log(`IPC spawn error: ${JSON.stringify(error)}`);
      });

      this._ipc.stdin.setEncoding('utf8');
      this._ipc.stdin.on('error', error => {
        // To avoid infinite loop, only log to console.
        console.log(`IPC write error: ${error && error.toString()}\r\n`);
      });

      this._ipc.stdout.on('data', data => {
        if (data) {
          // To avoid infinite loop, only log to console.
          console.log(`IPC output: ${data.toString()}\r\n`);
        }
      });
      this._ipc.stdout.on('error', error => {
        // To avoid infinite loop, only log to console.
        console.log(`IPC read error: ${error && error.toString()}\r\n`);
      });

      this._ipc.stderr.on('data', data => {
        if (data) {
          // To avoid infinite loop, only log to console.
          console.log(`IPC error: ${data.toString()}\r\n`);
        }
      });
    } catch (error) {
      // To avoid infinite loop, only log to console.
      console.log(`IPC spawn error: ${JSON.stringify(error)}`);
    }
  }

  public isHealthy() {
    return this._ipc && this._ipc.exitCode === null;
  }

  public trackEvent(
    name: string,
    properties?: { [name: string]: string },
    measurements?: { [name: string]: number },
    eventType?: EventType
  ) {
    if (this.isHealthy()) {
      try {
        const customDimensions = typeof properties === 'string' ? { message: properties } : properties;
        const data = {
          eventName: eventType,
          timeStamp: Date().toLocaleString(),
          name,
          customDimensions,
          measurements,
        };
        this._ipc.stdin.write(`${JSON.stringify(data)}\r\n`);
      } catch (error) {
        // To avoid infinite loop, only log to console.
        console.log(`IPC write error: ${JSON.stringify(error)}`);
      }
    }
  }

  public trackMetric(name: string, value: number) {
    if (this.isHealthy()) {
      try {
        this._ipc.stdin.write(`${JSON.stringify({ name, value, eventName: EventType.Metric })}\r\n`);
      } catch (error) {
        // To avoid infinite loop, only log to console.
        console.log(`IPC write error: ${JSON.stringify(error)}`);
      }
    }
  }
}
