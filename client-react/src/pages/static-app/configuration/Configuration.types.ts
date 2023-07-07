import { IDropdownOption } from '@fluentui/react';
import { FormikProps } from 'formik';
import * as Yup from 'yup';
import { StatusMessage } from '../../../components/ActionBar';
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

export interface ConfigurationSnippetsProps {
  disabled: boolean;
  formProps: FormikProps<ConfigurationFormData>;
  isLoading: boolean;
  resourceId: string;
  hasWritePermissions: boolean;
  refresh: (currentEnvironment?: ArmObj<Environment>) => Promise<void>;
}
export interface ConfigurationSnippetsAddEditProps {
  dismissPanel: (ev?: React.SyntheticEvent<HTMLElement, Event> | KeyboardEvent | undefined) => void;
  disabled: boolean;
  formProps: FormikProps<ConfigurationFormData>;
  isLoading: boolean;
  resourceId: string;
  refresh: (currentEnvironment?: ArmObj<Environment>) => Promise<void>;
  hasWritePermissions: boolean;
  selectedSnippet?: Snippet;
}

export interface ConfigurationSnippetsAddEditFormProps {
  dismissPanel: (ev?: React.SyntheticEvent<HTMLElement, Event> | KeyboardEvent | undefined) => void;
  disabled: boolean;
  formProps: FormikProps<ConfigurationSnippetsAddEditFormData>;
  isLoading: boolean;
  environmentDropdownOptions: IDropdownOption[];
  atSnippetsLimit: boolean;
  hasWritePermissions: boolean;
  statusMessage?: StatusMessage;
  selectedSnippet?: Snippet;
}

export interface ConfigurationSnippetsAddEditFormData {
  isSnippetsDirty: boolean;
  snippetName: string;
  snippetLocation: SnippetLocation;
  snippetContent: string;
  snippetInsertBottom: boolean;
  snippetApplicableEnvironmentsMode: ApplicableEnvironmentsMode;
  snippetEnvironments: string[];
}

export type ConfigurationSnippetsYupValidationSchemaType = Yup.ObjectSchema<Yup.Shape<object, ConfigurationSnippetsAddEditFormData>>;

export enum PasswordProtectionTypes {
  Disabled = 'Disabled',
  StagingEnvironments = 'StagingEnvironments',
  AllEnvironments = 'AllEnvironments',
}

export enum StagingEnvironmentPolicyTypes {
  Disabled = 'Disabled',
  Enabled = 'Enabled',
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
export enum ApplicableEnvironmentsMode {
  SpecifiedEnvironments = 'SpecifiedEnvironments',
  AllEnvironments = 'AllEnvironments',
  StagingEnvironments = 'StagingEnvironments',
}

export enum SnippetLocation {
  Body = 'Body',
  Head = 'Head',
}

export enum SnippetInsetionLocation {
  prepend = 'prepend',
  append = 'append',
}

export interface Snippet {
  name: string;
  location: SnippetLocation;
  content: string;
  insertBottom: boolean;
  applicableEnvironmentsMode: ApplicableEnvironmentsMode;
  environments: string[];
  checked?: boolean;
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
  stagingEnvironmentPolicy?: StagingEnvironmentPolicyTypes;
  selectedEnvironment?: ArmObj<Environment>;
  allowConfigFileUpdates?: boolean;
  snippets?: Snippet[];
}

export type ConfigurationYupValidationSchemaType = Yup.ObjectSchema<Yup.Shape<object, ConfigurationFormData>>;

export interface ConfigurationFormProps {
  validationSchema?: ConfigurationYupValidationSchemaType;
  resourceId: string;
  environments: ArmObj<Environment>[];
  isLoading: boolean;
  isRefreshing: boolean;
  hasWritePermissions: boolean;
  apiFailure: boolean;
  fetchDataOnEnvironmentChange: (resourceId: string) => Promise<void>;
  fetchEnvironmentVariables: (resourceId: string) => void;
  refresh: (currentEnvironment?: ArmObj<Environment>) => Promise<void>;
  selectedEnvironmentVariableResponse?: ArmObj<KeyValue<string>>;
  staticSiteSku: StaticSiteSku;
  formData?: ConfigurationFormData;
  location?: string;
}

export interface ConfigurationPivotProps {
  resourceId: string;
  formProps: FormikProps<ConfigurationFormData>;
  environments: ArmObj<Environment>[];
  isRefreshing: boolean;
  isLoading: boolean;
  hasWritePermissions: boolean;
  apiFailure: boolean;
  fetchDataOnEnvironmentChange: (resourceId: string) => Promise<void>;
  selectedEnvironmentVariableResponse?: ArmObj<KeyValue<string>>;
  staticSiteSku: StaticSiteSku;
  refresh: (currentEnvironment?: ArmObj<Environment>) => Promise<void>;
}

export enum StaticSiteSku {
  Free = 'Free',
  Standard = 'Standard',
}
