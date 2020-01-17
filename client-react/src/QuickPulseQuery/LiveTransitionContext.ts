export interface LiveTransitionContext {
  stream: string;
  requestOptions?: LiveTransitionRequestContext;
  dependencyOptions?: LiveTransitionDependencyContext;
  exceptionOptions?: LiveTransitionExceptionContext;
}

export type LiveTransitionContextDetails = LiveTransitionRequestContext | LiveTransitionDependencyContext | LiveTransitionExceptionContext;

export interface LiveTransitionRequestContext {
  operationName: string;
}

export interface LiveTransitionDependencyContext {
  type: string;
  target: string;
  name: string;
}

export interface LiveTransitionExceptionContext {
  problemId: string;
}

export class LiveTransitionStreams {
  public static RequestDuration = 'RequestDuration';
  public static DependencyDuration = 'DependencyDuration';

  public static RequestCount = 'RequestCount';
  public static DepenencyCount = 'DependencyCount';

  public static FailedRequestCount = 'FailedRequestCount';
  public static FailedDepenencyCount = 'FailedDependencyCount';
  public static ExceptionCount = 'ExceptionCount';

  public static CPU = 'CPU';
  public static Memory = 'Memory';
}
