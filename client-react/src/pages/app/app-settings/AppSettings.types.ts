import { FormikProps } from 'formik';
import { AvailableStack } from '../../../models/available-stacks';
import { AzureStorageMount, KeyVaultReference, SiteConfig, VirtualApplication } from '../../../models/site/config';
import { ArmObj } from '../../../models/arm-obj';
import { Site, PublishingCredentialPolicies } from '../../../models/site/site';
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
  sticky?: boolean;
}

export interface FormConnectionString {
  name: string;
  value: string;
  type: string;
  sticky?: boolean;
}

export interface FormAzureStorageMounts extends AzureStorageMount {
  name: string;
  sticky?: boolean;
}

export interface FormErrorPage {
  key: string;
  errorCode: string;
  status: string;
  content?: string;
}

export interface AppSettingsFormValues {
  site: ArmObj<Site>;
  config: ArmObj<SiteConfig>;
  appSettings: FormAppSetting[];
  connectionStrings: FormConnectionString[];
  azureStorageMounts: FormAzureStorageMounts[];
  virtualApplications: VirtualApplication[];
  errorPages: FormErrorPage[];
  currentlySelectedStack: string;
  basicPublishingCredentialsPolicies: ArmObj<PublishingCredentialPolicies> | null;
  references?: KeyVaultReferences;
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

export interface KeyVaultReferenceSummary {
  name: string;
  reference: string;
  status: string;
  details: string;
}

export interface KeyVaultReferences {
  appSettings?: KeyVaultReferenceSummary[];
  connectionStrings?: KeyVaultReferenceSummary[];
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

export interface ServiceLinkerProps {
  onResourceConnectionClick?: () => void;
  onServiceLinkerUpdateClick?: (settingName: string) => void;
  onServiceLinkerDeleteClick?: (settingName: string) => void;
}

export type AppSettingsFormikPropsCombined = FormikProps<AppSettingsFormValues> & ServiceLinkerProps;
export interface AppSettingsFormProps extends AppSettingsFormikPropsCombined {
  asyncData: AppSettingsAsyncData;
  tab?: string;
}

export type LeaseDurationType = 'infinite' | 'fixed';

export type LeaseStateType = 'available' | 'leased' | 'expired' | 'breaking' | 'broken';

export type LeaseStatusType = 'locked' | 'unlocked';

export type PublicAccessType = 'container' | 'blob';

export interface ContainerProperties {
  leaseStatus?: LeaseStatusType;
  leaseState?: LeaseStateType;
  leaseDuration?: LeaseDurationType;
  publicAccess?: PublicAccessType;
  hasImmutabilityPolicy?: boolean;
  hasLegalHold?: boolean;
  lastModified: Date;
  etag: string;
}

export interface ContainerItem {
  metadata?: { [propertyName: string]: string };
  name: string;
  properties: ContainerProperties;
}

export interface ShareProperties {
  lastModified: Date;
  etag: string;
  quota: number;
}

export interface ShareItem {
  snapshot?: string;
  metadata?: { [propertyName: string]: string };
  name: string;
  properties: ShareProperties;
}

export enum KeyVaultReferenceStatus {
  resolved = 'resolved',
  initialized = 'initialized',
}

export interface ConfigKeyVaultReferenceList {
  keyToReferenceStatuses: { [name: string]: KeyVaultReference };
}

export enum AppSettingsTabs {
  applicationSettings = 'applicationSettings',
  functionRuntimeSettings = 'functionRuntimeSettings',
  generalSettings = 'generalSettings',
  defaultDocuments = 'defaultDocuments',
  pathMappings = 'pathMappings',
  customErrorPage = 'customErrorPage',
}
