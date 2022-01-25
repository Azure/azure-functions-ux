import { ArmObj } from '../../../models/arm-obj';
import { KeyValue } from '../../../models/portal-models';
import { Environment } from '../../../models/static-site/environment';

export interface EnvironmentVariable {
  name: string;
  value: string;
  checked?: boolean;
}

export enum PanelType {
  edit,
  bulk,
}

export interface ConfigurationProps {
  environments: ArmObj<Environment>[];
  isLoading: boolean;
  hasWritePermissions: boolean;
  apiFailure: boolean;
  fetchDataOnEnvironmentChange: (resourceId: string) => {};
  saveEnvironmentVariables: (resourceId: string, environmentVariables: EnvironmentVariable[]) => void;
  refresh: () => void;
  selectedEnvironmentVariableResponse?: ArmObj<KeyValue<string>>;
}

export interface ConfigurationGeneralSettingsProps {}

export enum PasswordProtectionTypes {
  Disabled = 'disabled',
  StagingOnly = 'stagingonly',
  StagingAndProduction = 'stagingandproduction',
}
