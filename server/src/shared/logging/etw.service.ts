import { ChildProcess, spawn } from 'child_process';
import { existsSync } from 'fs';

export enum EventType {
  Info = 'Info',
  Warning = 'Warning',
  Error = 'Error',
  Debug = 'Debug',
  Metric = 'Metric',
}

export class EtwService {
  private _ipc: ChildProcess;

  private _writeToSecondaryLogger: (name: string, properties?: { [name: string]: string }) => void;

  constructor(writeToSecondaryLogger: (name: string, properties?: { [name: string]: string }) => void) {
    this._writeToSecondaryLogger = writeToSecondaryLogger
      ? writeToSecondaryLogger
      : (name: string, properties?: { [name: string]: string }) => null;

    try {
      const etwLoggerPath = process.env.etwLoggerPath || './EtwLogger/EtwLogger.exe';

      if (!existsSync(etwLoggerPath)) {
        const message = `EtwLogger.exe does not exist at ${etwLoggerPath}`;
        console.warn(message);
        this._writeToSecondaryLogger('/error/server/EtwLogger/ExeNotFound', { message });
      }

      const etwLoggerProviderName = process.env.etwLoggerProviderName || 'AppServiceUxServerLogs';

      this._ipc = spawn(etwLoggerPath, [etwLoggerProviderName]);

      this._ipc.on('error', error => {
        const message = `IPC spawn error: ${this._getString(error)}`;
        console.error(message);
        this._writeToSecondaryLogger('/error/server/EtwLogger/SpawnError', { message });
        throw error;
      });
      this._ipc.on('exit', code => {
        const message = `IPC exited with code: ${code}`;
        console.error(message);
        this._writeToSecondaryLogger('/error/server/EtwLogger/Exit', { message });
      });

      this._ipc.stdin.on('error', error => {
        const message = `IPC stdin error: ${this._getString(error)}`;
        console.error(message);
        this._writeToSecondaryLogger('/error/server/EtwLogger/StdinError', { message });
      });

      this._ipc.stdout.setEncoding('utf8');
      this._ipc.stdout.on('data', data => {
        if (data) {
          console.log(`IPC stdout: ${data}`);
        }
      });
      this._ipc.stdout.on('error', error => {
        const message = `IPC stdout error: ${this._getString(error)}`;
        console.error(message);
        this._writeToSecondaryLogger('/error/server/EtwLogger/StdoutError', { message });
      });

      this._ipc.stderr.on('data', data => {
        if (data) {
          const message = `IPC stderr: ${this._getString(data)}`;
          console.error(message);
          this._writeToSecondaryLogger('/error/server/EtwLogger/Stderr', { message });
        }
      });
    } catch (error) {
      const message = `IPC initialization error: ${this._getString(error)}`;
      console.error(message);
      this._writeToSecondaryLogger('/error/server/EtwLogger/InitializationError', { message });
    }
  }

  public isHealthy() {
    return this._ipc && (this._ipc as any).exitCode === null;
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
        this._ipc.stdin.write(`${JSON.stringify(data)}\r\n`, 'utf8', error => {
          if (error) {
            const message = `IPC stdin write error: ${this._getString(error)}`;
            console.error(message);
            this._writeToSecondaryLogger('/error/server/EtwLogger/StdinWriteError', { message });
          }
        });
      } catch (error) {
        const message = `IPC stdin write error: ${this._getString(error)}`;
        console.error(message);
        this._writeToSecondaryLogger('/error/server/EtwLogger/StdinWriteError', { message });
      }
    }
  }

  public trackMetric(name: string, value: number) {
    if (this.isHealthy()) {
      try {
        this._ipc.stdin.write(`${JSON.stringify({ name, value, eventName: EventType.Metric })}\r\n`);
      } catch (error) {
        const message = `IPC stdin write error: ${this._getString(error)}`;
        console.error(message);
        this._writeToSecondaryLogger('/error/server/EtwLogger/StdinWriteError', { message });
      }
    }
  }

  private _getString(data: any) {
    return typeof data === 'string' ? data : JSON.stringify(data);
  }
}
