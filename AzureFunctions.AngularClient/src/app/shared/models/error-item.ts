import { ErrorEvent } from './error-event';

export interface ErrorItem {
    message: string;
    dateTime: string;
    date: Date;
    href?: string;
    hrefText?: string;
    errorEvent: ErrorEvent;
}