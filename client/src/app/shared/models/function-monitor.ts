import { FunctionAppContext } from '../function-app-context';
import { FunctionInfo } from './function-info';
import { ARMApplicationInsightsDescriptior } from '../resourceDescriptors';
import { ErrorEvent } from './error-event';

export interface FunctionInvocations {
  executingJobRunId: string;
  id: string;
  functionId: string;
  functionName: string;
  functionFullName: string;
  functionDisplayTitle: string;
  status: string;
  whenUtc: string;
  duration: number;
  exceptionMessage: string;
  exceptionType: string;
  hostInstanceId: string;
  instanceQueueName: string;
}

export interface FunctionInvocationDetails {
  name: string;
  description: string;
  argInvokeString: string;
  extendedBlobModel: string;
  status: string;
}

export interface FunctionAggregates {
  functionId: string;
  functionFullName: string;
  functionName: string;
  successCount: number;
  failedCount: number;
  isRunning: boolean;
}

export interface FunctionStats {
  startBucket: number;
  start: string;
  totalPass: number;
  totalFail: number;
  totalRun: number;
}

export interface FunctionMonitorInfo {
  functionAppContext: FunctionAppContext;
  functionAppSettings: { [key: string]: string };
  functionInfo: FunctionInfo;
  appInsightsResourceDescriptor: ARMApplicationInsightsDescriptior;
  appInsightsFeatureEnabled: boolean;
}

export interface MonitorDetailsInfo {
  functionMonitorInfo: FunctionMonitorInfo;
  operationId: string;
  id: string;
  invocationId: string;
}

export interface MonitorConfigureInfo {
  functionMonitorInfo: FunctionMonitorInfo;
  errorEvent: ErrorEvent;
}
