const appInsights = require('applicationinsights');
export class LogHelper {
    public static error(id: string, data: any) {
        if (!id || !data) {
            throw Error('You must provide a id and data');
        }

        const errorId = `/errors/server/${id}`;

        this.trackEvent(errorId, data);
    }

    public static warn(id: string, data: any) {
        if (!id || !data) {
            throw Error('You must provide a id and data');
        }

        const warningId = `/warnings/server/${id}`;

        this.trackEvent(warningId, data);
    }

    public static log(id: string, data: any) {
        if (!id || !data) {
            throw Error('You must provide a id and data');
        }

        const logId = `/info/server/${id}`;

        this.trackEvent(logId, data);
    }

    private static trackEvent(name: string, properties?: { [name: string]: string }, measurements?: { [name: string]: number }) {
        return appInsights.trackEvent(name, properties, measurements);
    }
}
