export interface SelectOption<T> {
  id?: number;
  disabled?: boolean;
  displayLabel: string;
  value: T;
}
