import { ArmObj, Site, SiteConfig, VirtualApplication } from '../../../models/WebAppModels';
import { IConnectionString } from '../../../modules/site/config/connectionstrings/actions';
import { AvailableStack } from '../../../models/available-stacks';
import { AppSetting } from '../../../modules/site/config/appsettings/appsettings.types';
import { FormikProps } from 'formik';

export interface AppSettingsFormValues {
  site: ArmObj<Site>;
  config: ArmObj<SiteConfig>;
  appSettings: AppSetting[];
  connectionStrings: IConnectionString[];
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
