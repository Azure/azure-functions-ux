export interface WebApiException {
    Message: string;
    ExceptionMessage: string;
    ExceptionType: string;
    StackTrace: string;
}

export interface FunctionRuntimeError {
    id: string;
    requestId: string;
    statusCode: number;
    message: string;
    messsage: string;
}
