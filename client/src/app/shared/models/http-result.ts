export interface HttpError {
  errorId: string;
  message?: string;
  result?: any;
}

export interface HttpResult<T> {
  isSuccessful: boolean;
  error: HttpError | null;
  result: T | null;
}

export interface ArmError {
  error: {
    code: 'InvalidAuthenticationTokenTenant' | 'ScopeLocked';
    message: string;
  };
}

export interface ArmPollError {
  Code: string;
  Message: string;
}

export interface HttpErrorResponse<T> {
  message: string;
  error: any | null;
  ok: boolean;
  headers: Headers;
  status: number;
  statusText: string;
  url: string | null;
  json(): T;
  text(): string;
}
