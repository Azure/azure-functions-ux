export type BottomTabEventType = 'isExpanded';

export interface BottomTabEvent<T> {
  type: BottomTabEventType;
  value: T;
}
