export interface EnvironmentVariable {
  name: string;
  value: string;
  checked?: boolean;
}

export enum PanelType {
  edit,
  bulk,
}
