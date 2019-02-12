import { FormikProps } from 'formik';

import { AvailableStack } from '../../../models/available-stacks';
import { ArmObj, Site, SiteConfig, VirtualApplication, AzureStorageMount } from '../../../models/WebAppModels';

export interface Permissions {
  production_write: boolean;
  app_write: boolean;
  editable: boolean; // Can show write-only fields like app settings but can't edit anything
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
