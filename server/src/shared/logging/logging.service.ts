import { Logger, LoggerService } from '@nestjs/common';
import { AppServicePerformanceCounters } from '../../types/app-service-performance-counters';
import * as appInsights from 'applicationinsights';

export class LoggingService extends Logger implements LoggerService {
  private client: appInsights.TelemetryClient;
  private ipc: any;

  constructor() {
    super();
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
      setInterval(this.trackAppServicePerformance, 30 * 1000);
      this.client = appInsights.defaultClient;
    }

    this.initializeIpc();
  }

  public error(message: any, trace?: string, context?: string) {
    super.error(message, trace, context);

    this.trackEvent(context, { trace, message: JSON.stringify(message) }, undefined, 'ErrorEvent');
  }

  public warn(message: any, context?: string) {
    super.warn(message, context);

    const warningId = `/warnings/server/${context}`;

    this.trackEvent(warningId, message, undefined, 'WarningEvent');
  }

  public log(message: any, context?: string) {
    super.log(message, context);

    const logId = `/info/server/${context}`;

    // tslint:disable-next-line:no-console
    this.trackEvent(logId, message, undefined, 'LogEvent');
  }

  public trackEvent(name: string, properties?: { [name: string]: string }, measurements?: { [name: string]: number }, eventName?: string) {
    try {
      const timeStamp = Date().toLocaleString();
      const data = { eventName, timeStamp, name, properties, measurements };
      this.ipc.stdin.write(`${JSON.stringify(data)}\r\n`);
    } catch (error) {
      // To avoid infinite loop, only log to console.
      console.log(JSON.stringify(error));
    }

    if (!process.env.aiInstrumentationKey || !this.client) {
      return;
    }

    return this.client.trackEvent({
      name,
      properties,
      measurements,
    });
  }
  private initializeIpc() {
    try {
      const spawn = require('child_process').spawn;
      let traceLoggingAppExePath = './src/TraceLogger/TraceLoggingApp.exe';
      const ipc = spawn(traceLoggingAppExePath);
      ipc.on('error', error => {
        console.log(`SPAWN ERROR: ${error}`);
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
      console.log(JSON.stringify(error));
    }
  }

  private trackAppServicePerformance() {
    // this is a special environment variable on AppService
    // It contains a JSON with the structure defined in AppServicePerformanceCounters
    // We track these as perf metrics into app insights
    const value = process.env.WEBSITE_COUNTERS_APP;
    const client = appInsights.defaultClient;
    if (value && client) {
      const counters = JSON.parse(value) as AppServicePerformanceCounters;
      for (const counterName in counters) {
        if (counters.hasOwnProperty(counterName)) {
          client.trackMetric({ name: counterName, value: counters[counterName] });
        }
      }
    }
  }
}
