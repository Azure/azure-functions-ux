import { ErrorEvent } from './error-event';

export interface ErrorItem {
    message: string;
    dateTime: string;
    date: Date;
    dismissable: boolean;
    href?: string;
    hrefText?: string;
    errorEvent: ErrorEvent;
}