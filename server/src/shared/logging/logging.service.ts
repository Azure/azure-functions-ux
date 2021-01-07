import { Logger, LoggerService } from '@nestjs/common';
import { AppServicePerformanceCounters } from '../../types/app-service-performance-counters';
import * as appInsights from 'applicationinsights';
import { EtwService, EventType } from './etw.service';

export class LoggingService extends Logger implements LoggerService {
  private client: appInsights.TelemetryClient;
  private etwService: EtwService;

  constructor() {
    super();
    this.initializeAppInsights();
    this.initializeEtwLogger();

    if (this.client || (this.etwService && this.etwService.isHealthy())) {
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
    if (process.env.WEBSITE_FIRST_PARTY_ID && this.etwService) {
      this.etwService.trackEvent(name, properties, measurements, eventType);
    }

    if (process.env.aiInstrumentationKey && this.client) {
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

  private initializeEtwLogger() {
    const writeToSecondaryLogger = (name: string, properties?: { [name: string]: string }) => {
      if (process.env.aiInstrumentationKey && this.client) {
        this.client.trackEvent({ name, properties });
      }
    };
    if (process.env.WEBSITE_FIRST_PARTY_ID) {
      this.etwService = new EtwService(writeToSecondaryLogger);
    }
  }

  private trackAppServicePerformance() {
    // this is a special environment variable on AppService
    // It contains a JSON with the structure defined in AppServicePerformanceCounters
    // We track these as perf metrics into app insights
    const value = process.env.WEBSITE_COUNTERS_APP;
    const client = appInsights.defaultClient;
    const etwService = this.etwService && this.etwService.isHealthy() ? this.etwService : null;
    if (value && (client || etwService)) {
      const counters = JSON.parse(value) as AppServicePerformanceCounters;
      for (const counterName in counters) {
        if (counters.hasOwnProperty(counterName)) {
          const data = { name: counterName, value: counters[counterName] };
          if (client) {
            client.trackMetric(data);
          }
          if (etwService) {
            etwService.trackMetric(counterName, counters[counterName]);
          }
        }
      }
    }
  }
}
