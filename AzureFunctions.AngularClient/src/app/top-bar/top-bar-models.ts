import { Observable, Subject } from 'rxjs/Rx';
export interface TopBarNotification{
    id : string;
    message : string;
    iconClass : string;
    learnMoreLink : string;
    clickCallback : () => void;
}