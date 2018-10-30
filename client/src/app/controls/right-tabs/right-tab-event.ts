export type RightTabEventType = 'isExpanded';

export interface RightTabEvent<T> {
  type: RightTabEventType;
  value: T;
}
