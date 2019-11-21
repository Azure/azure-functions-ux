import { FormikProps } from 'formik';
import { AvailableStack } from '../../../models/available-stacks';
import { AzureStorageMount, SiteConfig, VirtualApplication } from '../../../models/site/config';
import { ArmObj } from '../../../models/arm-obj';
import { Site } from '../../../models/site/site';
import { HostStatus } from '../../../models/functions/host-status';

export interface Permissions {
  production_write: boolean;
  app_write: boolean;
  editable: boolean; // Can show write-only fields like app settings but can't edit anything
  saving: boolean;
}
export interface FormAppSetting {
  name: string;
  value: string;
  sticky: boolean;
}

export interface FormConnectionString {
  name: string;
  value: string;
  type: string;
  sticky: boolean;
}

export interface FormAzureStorageMounts extends AzureStorageMount {
  name: string;
}
export interface AppSettingsFormValues {
  site: ArmObj<Site>;
  config: ArmObj<SiteConfig>;
  appSettings: FormAppSetting[];
  connectionStrings: FormConnectionString[];
  azureStorageMounts: FormAzureStorageMounts[];
  virtualApplications: VirtualApplication[];
  currentlySelectedStack: string;
  references?: AppSettingsReferences;
}

export interface FormState {
  values: AppSettingsFormValues;
}

export interface FormApi {
  submitForm: () => any;
  setValue: (property: string, value: any) => any;
  setValues: (object: any) => any;
}

export interface StacksProps extends FormikProps<AppSettingsFormValues> {
  fetchStacks: () => any;
}

export interface StackProps extends StacksProps {
  stacks?: ArmObj<AvailableStack>[];
  stacksLoading?: boolean;
  config?: any;
  configLoading?: boolean;
  fetchConfig?: () => any;
}

export interface AppSettingReferenceSummary {
  name: string;
  reference: string;
  status: string;
  details: string;
}

export interface AppSettingsReferences {
  appSettings: AppSettingReferenceSummary[] | null;
}

export enum LoadingStates {
  loading = 'loading',
  complete = 'complete',
  failed = 'failed',
}

export interface AsyncObj<T> {
  loadingState: LoadingStates;
  value?: T;
}

export interface AppSettingsAsyncData {
  functionsHostStatus: AsyncObj<ArmObj<HostStatus>>;
  functionsCount: AsyncObj<number>;
}

export interface AppSettingsFormProps extends FormikProps<AppSettingsFormValues> {
  asyncData: AppSettingsAsyncData;
}
