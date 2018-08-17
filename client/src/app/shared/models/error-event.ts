export interface ErrorEvent {
    details?: string;
    message: string;
    errorId: string;
    resourceId: string;
    href?: string;
    hrefText?: string;
}
