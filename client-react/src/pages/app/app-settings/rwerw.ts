import { FormikProps } from 'formik';

import { AvailableStack } from '../../../models/available-stacks';
import { ArmObj, Site, SiteConfig, VirtualApplication } from '../../../models/WebAppModels';

export interface FormAppSetting {
  name: string;
  value: string;
  sticky: boolean;
}

export interface FormConnectionString {
  name: string;
  value: string;
  type: number;
  sticky: boolean;
}

export interface AppSettingsFormValues {
  site: ArmObj<Site>;
  config: ArmObj<SiteConfig>;
  appSettings: FormAppSetting[];
  connectionStrings: FormConnectionString[];
  virtualApplications: VirtualApplication[];
  currentlySelectedStack: string;
  siteWritePermission: boolean;
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
