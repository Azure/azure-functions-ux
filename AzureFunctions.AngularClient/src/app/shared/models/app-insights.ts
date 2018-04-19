export interface IAppInsights {
    config: IConfig;
    context: any;
    queue: (() => void)[];
    startTrackPage(name?: string);
    stopTrackPage(name?: string, url?: string, properties?: { [name: string]: string; }, measurements?: { [name: string]: number; });
    trackPageView(name?: string, url?: string, properties?: { [name: string]: string; }, measurements?: { [name: string]: number; }, duration?: number);
    startTrackEvent(name: string);
    stopTrackEvent(name: string, properties?: { [name: string]: string; }, measurements?: { [name: string]: number; });
    trackEvent(name: string, properties?: { [name: string]: string; }, measurements?: { [name: string]: number; });
    trackDependency(id: string, method: string, absoluteUrl: string, pathName: string, totalTime: number, success: boolean, resultCode: number);
    trackException(exception: Error, handledAt?: string, properties?: { [name: string]: string; }, measurements?: { [name: string]: number; }, severityLevel?: SeverityLevel);
    trackMetric(name: string, average: number, sampleCount?: number, min?: number, max?: number, properties?: { [name: string]: string; });
    trackTrace(message: string, properties?: { [name: string]: string; });
    flush();
    setAuthenticatedUserContext(authenticatedUserId: string, accountId?: string);
    clearAuthenticatedUserContext();
    downloadAndSetup?(config: IConfig): void;
    _onerror(message: string, url: string, lineNumber: number, columnNumber: number, error: Error);
}

export interface IConfig {
    instrumentationKey?: string;
    endpointUrl?: string;
    emitLineDelimitedJson?: boolean;
    accountId?: string;
    sessionRenewalMs?: number;
    sessionExpirationMs?: number;
    maxBatchSizeInBytes?: number;
    maxBatchInterval?: number;
    enableDebug?: boolean;
    disableExceptionTracking?: boolean;
    disableTelemetry?: boolean;
    verboseLogging?: boolean;
    diagnosticLogInterval?: number;
    samplingPercentage?: number;
    autoTrackPageVisitTime?: boolean;
    disableAjaxTracking?: boolean;
    overridePageViewDuration?: boolean;
    maxAjaxCallsPerView?: number;
    disableDataLossAnalysis?: boolean;
    disableCorrelationHeaders?: boolean;
    disableFlushOnBeforeUnload?: boolean;
    enableSessionStorageBuffer?: boolean;
    cookieDomain?: string;
    isRetryDisabled?: boolean;
    isPerfAnalyzerEnabled?: boolean;
    url?: string;
}

export enum SeverityLevel {
    Verbose = 0,
    Information = 1,
    Warning = 2,
    Error = 3,
    Critical = 4,
}
