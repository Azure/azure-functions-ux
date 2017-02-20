import { Observable, Subject } from 'rxjs/Rx';
export interface TopBarNotification{
    message : string;
    iconClass : string;
    learnMoreLink : string;
    clickCallback : () => void;
}