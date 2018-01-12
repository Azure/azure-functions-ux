export interface FunctionAppHttpError {
    errorId: string;
    message?: string;
}

export interface FunctionAppHttpResult<T> {
    isSuccessful: boolean;
    error: FunctionAppHttpError | null;
    result: T | null;
}
