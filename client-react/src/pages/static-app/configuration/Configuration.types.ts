import { FormikProps } from 'formik';
import * as Yup from 'yup';
import { ArmObj } from '../../../models/arm-obj';
import { KeyValue } from '../../../models/portal-models';
import { Environment } from '../../../models/static-site/environment';
import { StaticSiteSku } from '../skupicker/StaticSiteSkuPicker.types';

export interface EnvironmentVariable {
  name: string;
  value: string;
  checked?: boolean;
}

export enum PanelType {
  edit,
  bulk,
}

export interface ConfigurationDataLoaderProps {
  resourceId: string;
}

export interface ConfigurationProps {
  isRefreshing: boolean;
  formProps: FormikProps<ConfigurationFormData>;
  environments: ArmObj<Environment>[];
  isLoading: boolean;
  hasWritePermissions: boolean;
  apiFailure: boolean;
  fetchDataOnEnvironmentChange: (resourceId: string) => Promise<void>;
  selectedEnvironmentVariableResponse?: ArmObj<KeyValue<string>>;
}

export interface ConfigurationGeneralSettingsProps {
  disabled: boolean;
  formProps: FormikProps<ConfigurationFormData>;
  staticSiteSku: StaticSiteSku;
  isLoading: boolean;
}

export enum PasswordProtectionTypes {
  Disabled = 'Disabled',
  StagingEnvironments = 'StagingEnvironments',
  AllEnvironments = 'AllEnvironments',
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

export interface ConfigurationFormData {
  environments: ArmObj<Environment>[];
  environmentVariables: EnvironmentVariable[];
  passwordProtectionEnvironments: string;
  passwordProtection: PasswordProtectionTypes;
  visitorPassword: string;
  visitorPasswordConfirm: string;
  isAppSettingsDirty: boolean;
  isGeneralSettingsDirty: boolean;
  selectedEnvironment?: ArmObj<Environment>;
  allowConfigFileUpdates?: boolean;
}

export type ConfigurationYupValidationSchemaType = Yup.ObjectSchema<Yup.Shape<object, ConfigurationFormData>>;

export interface ConfigurationFormProps {
  formData?: ConfigurationFormData;
  validationSchema?: ConfigurationYupValidationSchemaType;
  resourceId: string;
  environments: ArmObj<Environment>[];
  isLoading: boolean;
  isRefreshing: boolean;
  hasWritePermissions: boolean;
  apiFailure: boolean;
  fetchDataOnEnvironmentChange: (resourceId: string) => Promise<void>;
  fetchEnvironmentVariables: (resourceId: string) => void;
  refresh: (currentEnvironment?: ArmObj<Environment>) => void;
  selectedEnvironmentVariableResponse?: ArmObj<KeyValue<string>>;
  staticSiteSku: StaticSiteSku;
  location?: string;
}

export interface ConfigurationPivotProps {
  formProps: FormikProps<ConfigurationFormData>;
  environments: ArmObj<Environment>[];
  isRefreshing: boolean;
  isLoading: boolean;
  hasWritePermissions: boolean;
  apiFailure: boolean;
  fetchDataOnEnvironmentChange: (resourceId: string) => Promise<void>;
  selectedEnvironmentVariableResponse?: ArmObj<KeyValue<string>>;
  staticSiteSku: StaticSiteSku;
}
