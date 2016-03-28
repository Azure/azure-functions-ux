export interface DropDownElement<T> {
    id?: number;
    displayLabel: string;
    value: T;
    default?: boolean;
}