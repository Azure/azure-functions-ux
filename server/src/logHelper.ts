const appInsights = require('applicationinsights');
export class LogHelper {
    public static error(id: string, data: any) {
        if (!id || !data) {
            throw Error('You must provide a id and data');
        }

        const errorId = `/errors/server/${id}`;

        LogHelper.trackEvent(errorId, data);
    }

    public static warn(id: string, data: any) {
        if (!id || !data) {
            throw Error('You must provide a id and data');
        }

        const warningId = `/warnings/server/${id}`;

        LogHelper.trackEvent(warningId, data);
    }

    public static log(id: string, data: any) {
        if (!id || !data) {
            throw Error('You must provide a id and data');
        }

        const logId = `/info/server/${id}`;

        LogHelper.trackEvent(logId, data);
    }

    private static trackEvent(name: string, properties?: { [name: string]: string }, measurements?: { [name: string]: number }) {
        if(!appInsights.trackEvent){
            console.log(properties);
            return;
        }
        return appInsights.trackEvent(name, properties, measurements);
    }
}
