export interface HttpError {
    preconditionSuccess: boolean;
    errorId: string;
    message?: string;
}

export interface HttpResult<T> {
    isSuccessful: boolean;
    error: HttpError | null;
    result: T | null;
}
