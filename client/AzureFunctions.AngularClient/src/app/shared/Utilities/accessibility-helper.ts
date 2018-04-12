import { KeyCodes } from './../models/constants';

export class AccessibilityHelper {
    public static isEnterOrSpace(event: any) {
        return (event.keyCode === KeyCodes.enter || event.keyCode === KeyCodes.space);
    }
}

