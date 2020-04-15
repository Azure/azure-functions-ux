import { Logger, LoggerService } from '@nestjs/common';
import { AppServicePerformanceCounters } from '../../types/app-service-performance-counters';
import * as appInsights from 'applicationinsights';

export class LoggingService extends Logger implements LoggerService {
  private client: appInsights.TelemetryClient;
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
  }

  public error(message: any, trace?: string, context?: string) {
    super.error(message, trace, context);

    this.trackEvent(context, { trace, message: JSON.stringify(message) });
  }

  public warn(message: any, context?: string) {
    super.warn(message, context);

    const warningId = `/warnings/server/${context}`;

    this.trackEvent(warningId, message);
  }

  public log(message: any, context?: string) {
    super.log(message, context);

    const logId = `/info/server/${context}`;

    // tslint:disable-next-line:no-console
    this.trackEvent(logId, message);
  }

  public trackEvent(name: string, properties?: { [name: string]: string }, measurements?: { [name: string]: number }) {
    if (!process.env.aiInstrumentationKey || !this.client) {
      return;
    }

    return this.client.trackEvent({
      name,
      properties,
      measurements,
    });
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
