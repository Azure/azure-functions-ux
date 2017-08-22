import { Url } from 'app/shared/Utilities/url';

export class Logger {
    static debugging: boolean = (Url.getParameterByName(null, 'appsvc.log') === 'debug');

    public static debug(obj: any) {
        if (Logger.debugging) {
            console.log(obj);
        }
    }
}