export interface ErrorEvent {
    message: string;
    errorId: string;
    errorType: ErrorType;
    details?: string;
}

export enum ErrorType {
    Information,
    Warning,
    UserError,
    FunctionError,
    RuntimeError,
    ApiError,
    Fatal
}
