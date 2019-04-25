export interface FunctionKey {
  name: string;
  value: string;
  show?: boolean;
  selected?: boolean;
}

export interface FunctionKeys {
  keys: Array<FunctionKey>;
}

export interface HostKeys {
  masterKey: string;
  functionKeys: HostFunctionKeys;
  systemKeys: HostSystemKeys;
}

export interface HostFunctionKeys {
  keys: Array<FunctionKey>;
}

export interface HostSystemKeys {
  keys: Array<FunctionKey>;
}
