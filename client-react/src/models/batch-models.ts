/**
 * These interfaces are a way of creating a maintainable or string type
 * in combination with "keyof". This produces intellisense for apis.
 * e.g. "GET" | "HEAD" | "POST" | "PUT" | "DELETE"
 */
interface BatchHttpMethods {
  GET: void;
  HEAD: void;
  POST: void;
  PUT: void;
  DELETE: void;
  PATCH: void;
}

export type BatchHttpMethod = keyof BatchHttpMethods;

/**
 * The settings for the batch call.
 */
export interface BatchSettings {
  /**
   * The request options.
   */
  options?: RequestOptions;
  /**
   * The telemetry header to set.
   */
  setTelemetryHeader?: string;
  /**
   * The http method to use. Defaults to GET.
   */
  type?: BatchHttpMethod;
  /**
   * The URI to call.
   */
  uri: string;
  /**
   * Optional content to set for the reqeusts.
   */
  content?: any;
}

export interface BatchUpdateSettings extends BatchSettings {
  notificationTitle: string;
  notificationDescription: string;
  notificationSuccessDescription: string;
  notificationFailureDescription: string;
}

export const enum RequestOptions {
  /**
   * Default behavior.
   *    - Defaults to foreground request
   *    - Calls are batched to ARM every 100 ms
   *    - Any ServerTimeout (503) failures for foreground GET requests
   *      are automatically retried by calling the API directly wihtout batch
   *    - Responses are not cached
   */
  None = 0,
  /**
   * Make the batch call on the next tick.
   * DebounceNextTick takes precedence over Debounce100Ms.
   */
  DebounceNextTick = 1,
  /**
   * Include the request in a batch call that is made after a 100ms delay.
   * Debounce100Ms takes precedence over DebounceOneMinute
   */
  Debounce100ms = 2,
  /**
   * Sets this request to run in the background.
   * Background requests are batched every 60 seconds.
   */
  DebounceOneMinute = 4,
  /**
   * Forces a retry for any failure returned (statusCode >= 400) regardless of the HTTP method.
   */
  RetryForce = 8,
  /**
   * Skips the default retry.
   * SkipRetry takes precedence over ForceRetry if both are set.
   */
  RetrySkip = 16,
  /**
   * Caches the response for GET requests for 10 seconds.
   */
  ResponseCacheEnabled = 32,
  /**
   * Skips caching the response for GET requests.
   */
  ResponseCacheSkip = 64,
  /**
   * Skips retry when a forbidden gateway error is received.
   */
  RetrySkipOnForbidden = 128,
}

export interface BatchResponseItemEx<T> extends BatchResponseItem<T> {
  isSuccessful: boolean;
  error?: ArmError;
}

/**
 * Response for a request within a batch.
 */
interface BatchResponseItem<T> {
  /**
   * The response content. Can be success or failure.
   */
  readonly content: T;
  /**
   * The response headers.
   */
  readonly headers: ReadonlyStringMap<string>;
  /**
   * The response status code.
   */
  readonly httpStatusCode: number;
}

interface ReadonlyStringMap<T> {
  readonly [key: string]: T;
}

interface ArmError {
  code: 'ResourceNotFound' | 'ScopeLocked';
  message: string;
}
