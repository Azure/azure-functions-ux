import { Logger, LoggerService } from '@nestjs/common';
import { AppServicePerformanceCounters } from '../../types/app-service-performance-counters';
import * as appInsights from 'applicationinsights';

export enum EventType {
  Info = 'Info',
  Warning = 'Warning',
  Error = 'Error',
  Debug = 'Debug',
  Metric = 'Metric',
}

export class LoggingService extends Logger implements LoggerService {
  private client: appInsights.TelemetryClient;
  private ipc: any;
  private ipcHealthy = true;

  constructor() {
    super();
    this.initializeAppInsights();
    this.initializeIpc();

    if (this.client || (this.ipc && this.ipcHealthy)) {
      setInterval(this.trackAppServicePerformance, 30 * 1000);
    }
  }

  public error(message: any, trace?: string, context?: string) {
    super.error(message, trace, context);

    this.trackEvent(context, { trace, message: JSON.stringify(message) }, undefined, EventType.Error);
  }

  public warn(message: any, context?: string) {
    super.warn(message, context);

    const warningId = `/warnings/server/${context}`;

    this.trackEvent(warningId, message, undefined, EventType.Warning);
  }

  public log(message: any, context?: string) {
    super.log(message, context);

    const logId = `/info/server/${context}`;

    // tslint:disable-next-line:no-console
    this.trackEvent(logId, message, undefined, EventType.Info);
  }

  public trackEvent(
    name: string,
    properties?: { [name: string]: string },
    measurements?: { [name: string]: number },
    eventType?: EventType
  ) {
    if (this.ipc && this.ipcHealthy) {
      try {
        const props = typeof properties === 'string' ? { message: properties } : properties;
        const data = {
          eventName: eventType,
          timeStamp: Date().toLocaleString(),
          name,
          properties: props,
          measurements,
        };
        this.ipc.stdin.write(`${JSON.stringify(data)}\r\n`);
      } catch (error) {
        // To avoid infinite loop, only log to console.
        console.log(JSON.stringify(error));
      }
    }

    if (!process.env.aiInstrumentationKey || !this.client) {
      this.client.trackEvent({
        name,
        properties,
        measurements,
      });
    }
  }

  private initializeAppInsights() {
    if (process.env.aiInstrumentationKey) {
      appInsights
        .setup(process.env.aiInstrumentationKey)
        .setAutoDependencyCorrelation(true)
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true)
        .setAutoCollectExceptions(true)
        .setAutoCollectDependencies(true)
        .setAutoCollectConsole(true)
        .setUseDiskRetryCaching(true)
        .start();
      this.client = appInsights.defaultClient;
    }
  }

  private initializeIpc() {
    try {
      const spawn = require('child_process').spawn;
      const traceLoggingAppExePath = process.env.traceLoggingAppExePath || './src/TraceLogger/TraceLoggingApp.exe';
      const ipc = spawn(traceLoggingAppExePath);
      ipc.on('error', error => {
        this.ipcHealthy = false;
        const message = `IPC SPAWN ERROR: ${JSON.stringify(error)}`;
        const eventId = '/error/server/ipcSpawnFailure';
        this.trackEvent(eventId, { message }, undefined, EventType.Error);
        console.log(message);
      });
      ipc.stdin.setEncoding('utf8');
      ipc.stderr.on('data', data => {
        process.stderr.write(`\r\n<STDERR>\r\n${data.toString()}\r\n</STDERR>\r\n`);
      });
      ipc.stdout.on('data', data => {
        process.stdout.write(`\r\n<STDOUT>\r\n${data.toString()}\r\n</STDOUT>\r\n`);
      });
      this.ipc = ipc;
    } catch (error) {
      this.ipcHealthy = false;
      const message = `IPC SPAWN ERROR: ${JSON.stringify(error)}`;
      const eventId = '/error/server/ipcSpawnFailure';
      this.trackEvent(eventId, { message }, undefined, EventType.Error);
      console.log(message);
    }
  }

  private trackAppServicePerformance() {
    // this is a special environment variable on AppService
    // It contains a JSON with the structure defined in AppServicePerformanceCounters
    // We track these as perf metrics into app insights
    const value = process.env.WEBSITE_COUNTERS_APP;
    const client = appInsights.defaultClient;
    const ipc = this.ipcHealthy && this.ipc;
    if (value && (client || ipc)) {
      const counters = JSON.parse(value) as AppServicePerformanceCounters;
      for (const counterName in counters) {
        if (counters.hasOwnProperty(counterName)) {
          const data = { name: counterName, value: counters[counterName] };
          if (client) {
            client.trackMetric(data);
          }
          if (ipc) {
            try {
              this.ipc.stdin.write(`${JSON.stringify({ ...data, eventName: EventType.Metric })}\r\n`);
            } catch (error) {
              // To avoid infinite loop, only log to console.
              console.log(JSON.stringify(error));
            }
          }
        }
      }
    }
  }
}
