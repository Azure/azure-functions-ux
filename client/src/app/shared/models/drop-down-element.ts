export interface DropDownElement<T> {
  id?: number;
  displayLabel: string;
  value: T;
  default?: boolean;
}

export interface DropDownGroupElement<T> {
  displayLabel: string;
  dropDownElements: DropDownElement<T>[];
}

export interface MultiDropDownElement<T> extends DropDownElement<T> {
  isSelected?: boolean;
  isFocused?: boolean;
}
