export type FunctionEditorEventType = 'runTest';

export interface FunctionEditorEvent<T> {
  type: FunctionEditorEventType;
  value: T;
}
