export interface FunctionKey {
  name: string;
  value: string;
  show?: boolean;
  selected?: boolean;
}

export interface FunctionKeys {
  keys: Array<FunctionKey>;
}
