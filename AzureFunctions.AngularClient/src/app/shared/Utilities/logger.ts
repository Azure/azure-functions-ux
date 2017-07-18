import { Url } from "app/shared/Utilities/url";

export class Logger {
    static debugging: any; boolean = (Url.getParameterByName(null, "appsvc.log") === 'debug');

    public static debug(obj: any) {
        if (this.debugging) {
            console.log(obj);
        }
    }
}