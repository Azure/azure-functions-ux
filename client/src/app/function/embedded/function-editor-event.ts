export type FunctionEditorEventType = 'runTest' | 'copyLogs' | 'pauseLogs' | 'startLogs' | 'clearLogs';

export interface FunctionEditorEvent<T> {
    type: FunctionEditorEventType;
    value: T;
}