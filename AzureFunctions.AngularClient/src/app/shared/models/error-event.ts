export interface ErrorEvent {
    message: string;
    errorId: string;
    errorLevel: ErrorLevel;
    details?: string;
}

export enum ErrorLevel {
    Information,
    Warning,
    UserError,
    RuntimeError,
    ApiError,
    Fatal
}
