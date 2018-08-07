import * as appInsights from 'applicationinsights';
export class LogHelper {
    public static error(id: string, data: any) {
        if (!id || !data) {
            throw Error('You must provide a id and data');
        }

        const errorId = `/errors/server/${id}`;
        let errorMessage = "No Data";
        if(data && data.message){
            errorMessage = data.message
        } else if(data){
            errorMessage = JSON.stringify(data);
        }
        
        LogHelper.trackEvent(errorId, {error: errorMessage});
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
        const client = appInsights.defaultClient;
        if(!process.env.aiInstrumentationKey){
            console.log(properties);
            return;
        }
        return client.trackEvent({
            name, 
            properties, 
            measurements
        });
    }
}
