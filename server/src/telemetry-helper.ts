import { AppServicePerformanceCounters } from './types/app-service-performance-counters';
import * as appInsights from 'applicationinsights';

export function trackAppServicePerformance() {
    // this is a special environment variable on AppService
    // It contains a JSON with the structure defined in AppServicePerformanceCounters
    // We track these as perf metrics into app insights
    const value = process.env['WEBSITE_COUNTERS_APP'];
    if (value) {
        const counters = JSON.parse(value) as AppServicePerformanceCounters;
        const client = appInsights.defaultClient;
        for (const counterName in counters) {
            if (counters.hasOwnProperty(counterName)) {
                client.trackMetric({ name: counterName, value: counters[counterName] });
            }
        }
    }
}
