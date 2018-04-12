export interface DiagnosticsResult {
    isDiagnosingSuccessful: boolean;
    errorResult: DiagnoseErrorResult;
    successResult: DiagnoseSuccessResult;
}

export interface DiagnoseErrorResult {
    errorMessage: string;
    errorId: string;
    errorAction: string;
}

export interface DiagnoseSuccessResult {
    isTerminating: boolean;
    hasUserAction: boolean;
    message: string;
    actionId: string;
    userAction: string;
}
