import {Injectable} from '@angular/core';
import {IAppInsights, IConfig, SeverityLevel} from '../models/app-insights';

declare var appInsights: IAppInsights;

function AiDefined() {
    return (target: Object, functionName: string, descriptor: TypedPropertyDescriptor<any>) => {
        let originalMethod = descriptor.value;
        descriptor.value = function(...args: any[]) {
            if (typeof(appInsights) !== 'undefined' &&
                typeof(appInsights[functionName]) !== 'undefined') {
                return originalMethod.apply(this, args);
            } else {
                return null;
            }
        };
        return descriptor;
    };
}

function run<T>(action: () => T) {
    if (typeof(appInsights) !== 'undefined') {
        return action();
    }
}

@Injectable()
export class AiService implements IAppInsights {

    /*
    * Config object used to initialize AppInsights
    */
    config: IConfig = run(() => appInsights.config);

    context: any = run(() => appInsights.context);

    /*
    * Initialization queue. Contains functions to run when appInsights initializes
    */
    queue: (() => void)[] = run(() => appInsights.queue);

    /**
    * Sets the sessionId for all the current events.
    */
    @AiDefined()
    setSessionId(sessionId: string) {
        if (appInsights.queue) {
            appInsights.queue.push(() => {
                appInsights.context.addTelemetryInitializer(envelope => {
                    var telemetryItem = envelope.data.baseData;
                    telemetryItem.properties = telemetryItem.properties || {};
                    telemetryItem.properties['sessionId'] = sessionId;
                });
            });
        }
    }

    /**
    * Starts timing how long the user views a page or other item. Call this when the page opens.
    * This method doesn't send any telemetry. Call {@link stopTrackTelemetry} to log the page when it closes.
    * @param   name  A string that idenfities this item, unique within this HTML document. Defaults to the document title.
    */
    @AiDefined()
    startTrackPage(name?: string) {
        return appInsights.startTrackPage(name);
    }

    /**
    * Logs how long a page or other item was visible, after {@link startTrackPage}. Call this when the page closes.
    * @param   name  The string you used as the name in startTrackPage. Defaults to the document title.
    * @param   url   String - a relative or absolute URL that identifies the page or other item. Defaults to the window location.
    * @param   properties  map[string, string] - additional data used to filter pages and metrics in the portal. Defaults to empty.
    * @param   measurements    map[string, number] - metrics associated with this page, displayed in Metrics Explorer on the portal. Defaults to empty.
    */
    @AiDefined()
    stopTrackPage(name?: string, url?: string, properties?: { [name: string]: string; }, measurements?: { [name: string]: number; }) {
        return appInsights.stopTrackPage(name, url, properties, measurements);
    }

    /**
     * Logs that a page or other item was viewed.
     * @param   name  The string you used as the name in startTrackPage. Defaults to the document title.
     * @param   url   String - a relative or absolute URL that identifies the page or other item. Defaults to the window location.
     * @param   properties  map[string, string] - additional data used to filter pages and metrics in the portal. Defaults to empty.
     * @param   measurements    map[string, number] - metrics associated with this page, displayed in Metrics Explorer on the portal. Defaults to empty.
     * @param   duration    number - the number of milliseconds it took to load the page. Defaults to undefined. If set to default value, page load time is calculated internally.
     */
    @AiDefined()
    trackPageView(name?: string, url?: string, properties?: { [name: string]: string; }, measurements?: { [name: string]: number; }, duration?: number) {
        return appInsights.trackPageView(name, url, properties, measurements);
    }

    /**
     * Start timing an extended event. Call {@link stopTrackEvent} to log the event when it ends.
     * @param   name    A string that identifies this event uniquely within the document.
     */
    @AiDefined()
    startTrackEvent(name: string) {
        return appInsights.startTrackEvent(name);
    }


    /**
     * Log an extended event that you started timing with {@link startTrackEvent}.
     * @param   name    The string you used to identify this event in startTrackEvent.
     * @param   properties  map[string, string] - additional data used to filter events and metrics in the portal. Defaults to empty.
     * @param   measurements    map[string, number] - metrics associated with this event, displayed in Metrics Explorer on the portal. Defaults to empty.
     */
    @AiDefined()
    stopTrackEvent(name: string, properties?: { [name: string]: string; }, measurements?: { [name: string]: number; }){
        return appInsights.stopTrackEvent(name, properties, measurements);
    }

    /**
    * Log a user action or other occurrence.
    * @param   name    A string to identify this event in the portal.
    * @param   properties  map[string, string] - additional data used to filter events and metrics in the portal. Defaults to empty.
    * @param   measurements    map[string, number] - metrics associated with this event, displayed in Metrics Explorer on the portal. Defaults to empty.
    */
    @AiDefined()
    trackEvent(name: string, properties?: { [name: string]: string; }, measurements?: { [name: string]: number; }){
        return appInsights.trackEvent(name, properties, measurements);
    }

    /**
     * Log a dependency call
     * @param id    unique id, this is used by the backend o correlate server requests. Use Util.newId() to generate a unique Id.
     * @param method    represents request verb (GET, POST, etc.)
     * @param absoluteUrl   absolute url used to make the dependency request
     * @param pathName  the path part of the absolute url
     * @param totalTime total request time
     * @param success   indicates if the request was sessessful
     * @param resultCode    response code returned by the dependency request
     */
    @AiDefined()
    trackDependency(id: string, method: string, absoluteUrl: string, pathName: string, totalTime: number, success: boolean, resultCode: number){
        return appInsights.trackDependency(id, method, absoluteUrl, pathName, totalTime, success, resultCode);
    }

    /**
     * Log an exception you have caught.
     * @param   exception   An Error from a catch clause, or the string error message.
     * @param   properties  map[string, string] - additional data used to filter events and metrics in the portal. Defaults to empty.
     * @param   measurements    map[string, number] - metrics associated with this event, displayed in Metrics Explorer on the portal. Defaults to empty.
     * @param   severityLevel   AI.SeverityLevel - severity level
     */
    @AiDefined()
    trackException(exception: Error, handledAt?: string, properties?: { [name: string]: string; }, measurements?: { [name: string]: number; }, severityLevel?: SeverityLevel){
        return appInsights.trackException(exception, handledAt, properties, measurements);
    }

    /**
     * Log a numeric value that is not associated with a specific event. Typically used to send regular reports of performance indicators.
     * To send a single measurement, use just the first two parameters. If you take measurements very frequently, you can reduce the
     * telemetry bandwidth by aggregating multiple measurements and sending the resulting average at intervals.
     * @param   name    A string that identifies the metric.
     * @param   average Number representing either a single measurement, or the average of several measurements.
     * @param   sampleCount The number of measurements represented by the average. Defaults to 1.
     * @param   min The smallest measurement in the sample. Defaults to the average.
     * @param   max The largest measurement in the sample. Defaults to the average.
     */
    @AiDefined()
    trackMetric(name: string, average: number, sampleCount?: number, min?: number, max?: number, properties?: { [name: string]: string; }){
        return appInsights.trackMetric(name, average, sampleCount, min, max, properties);
    }

    /**
    * Log a diagnostic message.
    * @param    message A message string
    * @param   properties  map[string, string] - additional data used to filter traces in the portal. Defaults to empty.
    */
    @AiDefined()
    trackTrace(message: string, properties?: { [name: string]: string; }) {
        return appInsights.trackTrace(message, properties);
    }


    /**
     * Immediately send all queued telemetry.
     */
    @AiDefined()
    flush() {
        return appInsights.flush();
    }


    /**
    * Sets the autheticated user id and the account id in this session.
    * User auth id and account id should be of type string. They should not contain commas, semi-colons, equal signs, spaces, or vertical-bars.
    *
    * @param authenticatedUserId {string} - The authenticated user id. A unique and persistent string that represents each authenticated user in the service.
    * @param accountId {string} - An optional string to represent the account associated with the authenticated user.
    */
    @AiDefined()
    setAuthenticatedUserContext(authenticatedUserId: string, accountId?: string) {
        return appInsights.setAuthenticatedUserContext(authenticatedUserId, accountId);
    }


    /**
     * Clears the authenticated user id and the account id from the user context.
     */
    @AiDefined()
    clearAuthenticatedUserContext() {
        return appInsights.clearAuthenticatedUserContext();
    }

    /*
    * Downloads and initializes AppInsights. You can override default script download location by specifying url property of `config`.
    */
    @AiDefined()
    downloadAndSetup(config: IConfig): void {
        return appInsights.downloadAndSetup(config);
    }

    /**
     * The custom error handler for Application Insights
     * @param {string} message - The error message
     * @param {string} url - The url where the error was raised
     * @param {number} lineNumber - The line number where the error was raised
     * @param {number} columnNumber - The column number for the line where the error was raised
     * @param {Error}  error - The Error object
     */
     @AiDefined()
    _onerror(message: string, url: string, lineNumber: number, columnNumber: number, error: Error) {
        return appInsights._onerror(message, url, lineNumber, columnNumber, error);
    }
}
