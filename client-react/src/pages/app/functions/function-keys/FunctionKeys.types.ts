export interface FunctionKeysModel {
  name: string;
  value: string;
}

export interface FunctionKeysFormValues {
  keys: FunctionKeysModel[];
}

export enum DialogType {
  renew,
  delete,
}
