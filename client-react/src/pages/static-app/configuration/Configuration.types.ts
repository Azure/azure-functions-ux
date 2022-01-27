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

export interface ConfigurationGeneralSettingsProps {
  disabled: boolean;
  visitorPassword: string;
  setVisitorPassword: React.Dispatch<React.SetStateAction<string>>;
}

export enum PasswordProtectionTypes {
  Disabled = 'disabled',
  StagingOnly = 'stagingonly',
  StagingAndProduction = 'stagingandproduction',
}

export enum SecretState {
  None = 'None',
  Password = 'Password',
  SecretUrl = 'SecretUrl',
}

// All Environments: all environments are locked down via password auth
// StagingEnvironments: all stage environments are locked down
// SpecifiedEnvironments: specify the environment names as a comma separated list via the "environments" property.
// Prod environment is referred to as 'default'
export enum applicableEnvironmentsMode {
  SpecifiedEnvironments = 'SpecifiedEnvironments',
  AllEnvironments = 'AllEnvironments',
  StagingEnvironments = 'StagingEnvironments',
}
