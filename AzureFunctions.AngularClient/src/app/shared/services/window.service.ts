import {Injectable} from "@angular/core";

@Injectable()
export class WindowService {
    constructor() {

    }

    createWindow(url: string, name: string = 'Window', width: number = 500, height: number = 600, left: number = 0, top: number = 0) {
        if (url == null) {
            return null;
        }

        var options = `width=${width},height=${height},left=${left},top=${top}`;

        return window.open(url, name, options);
    }
}