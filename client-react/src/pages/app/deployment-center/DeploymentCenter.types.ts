import { ArmObj, ArmArray } from '../../../models/arm-obj';
import { PublishingCredentials, PublishingUser, PublishingProfile } from '../../../models/site/publish';
import { FormikProps } from 'formik';
import * as Yup from 'yup';
import { ScmTypes, BuildProvider } from '../../../models/site/config';
import moment from 'moment';
import { Uri } from 'monaco-editor';
import { GitHubUser } from '../../../models/github';
import { IDropdownOption } from 'office-ui-fabric-react';

export enum ContainerOptions {
  docker = 'docker',
  compose = 'compose',
  kubernetes = 'kube',
}

export enum ContainerRegistrySources {
  acr = 'acr',
  docker = 'docker',
  privateRegistry = 'privateRegistry',
}

export enum ContainerDockerAccessTypes {
  public = 'public',
  private = 'private',
}

export enum DeploymentStatus {
  Pending,
  Building,
  Deploying,
  Failed,
  Success,
}

export type DeploymentCenterContainerProps = DeploymentCenterContainerLogsProps &
  DeploymentCenterFtpsProps<DeploymentCenterContainerFormData>;

export type DeploymentCenterCodeProps = DeploymentCenterCodeLogsProps & DeploymentCenterFtpsProps<DeploymentCenterCodeFormData>;

export type DeploymentCenterYupValidationSchemaType<
  T = DeploymentCenterContainerFormData | DeploymentCenterCodeFormData
> = Yup.ObjectSchema<Yup.Shape<object, DeploymentCenterFormData<T>>>;

export type DeploymentCenterFormData<
  T = DeploymentCenterCodeFormData | DeploymentCenterContainerFormData
> = DeploymentCenterCommonFormData & T;

export interface DeploymentCenterCommonFormData {
  publishingUsername: string;
  publishingPassword: string;
  publishingConfirmPassword: string;
}

export interface DeploymentCenterContainerFormData {
  option: ContainerOptions;
  registrySource: ContainerRegistrySources;
  dockerAccessType: ContainerDockerAccessTypes;
  serverUrl: string;
  image: string;
  tag: string;
  username: string;
  password: string;
  command: string;
  cicd: boolean;
  scmType: ScmTypes;
}

export interface DeploymentCenterCodeFormData {
  sourceProvider: ScmTypes;
  buildProvider: BuildProvider;
  runtimeStack: string;
  runtimeVersion: string;
}

export interface DeploymentCenterFieldProps<T = DeploymentCenterContainerFormData | DeploymentCenterCodeFormData> {
  formProps?: FormikProps<DeploymentCenterFormData<T>>;
}

export interface DeploymentCenterContainerLogsProps {
  isLoading: boolean;
  logs?: string;
}

export interface DeploymentCenterCodeLogsProps {
  isLoading: boolean;
  deployments?: ArmArray<DeploymentProperties>;
  deploymentsError?: string;
  goToSettings?: () => void;
}

export interface DeploymentCenterCommitLogsProps {
  commitId?: string;
}

export interface DeploymentCenterFtpsProps<T = DeploymentCenterContainerFormData | DeploymentCenterCodeFormData>
  extends DeploymentCenterFieldProps<T> {
  isLoading: boolean;
  resetApplicationPassword: () => void;
  publishingCredentials?: ArmObj<PublishingCredentials>;
  publishingUser?: ArmObj<PublishingUser>;
  publishingProfile?: PublishingProfile;
}

export interface DeploymentCenterFormProps<T = DeploymentCenterContainerFormData | DeploymentCenterCodeFormData> {
  isLoading: boolean;
  refresh: () => void;
  showPublishProfilePanel: () => void;
  formData?: DeploymentCenterFormData<T>;
  formValidationSchema?: DeploymentCenterYupValidationSchemaType<T>;
}

export type DeploymentCenterContainerFormProps<T = DeploymentCenterContainerFormData> = DeploymentCenterContainerProps &
  DeploymentCenterFormProps<T>;

export type DeploymentCenterCodeFormProps<T = DeploymentCenterCodeFormData> = DeploymentCenterCodeProps & DeploymentCenterFormProps<T>;

export interface DeploymentCenterCommandBarProps {
  isLoading: boolean;
  saveFunction: () => void;
  discardFunction: () => void;
  showPublishProfilePanel: () => void;
  refresh: () => void;
}

export interface DeploymentCenterPublishProfilePanelProps {
  isPanelOpen: boolean;
  dismissPanel: () => void;
  resetApplicationPassword: () => void;
}

export interface DeploymentCenterPublishProfileCommandBarProps {
  resetApplicationPassword: () => void;
}

export interface DeploymentCenterGitHubProviderProps<T = DeploymentCenterContainerFormData | DeploymentCenterCodeFormData>
  extends DeploymentCenterFieldProps<T> {
  authorizeGitHubAccount: () => void;
  fetchOrganizationOptions: () => void;
  fetchRepositoryOptions: (repositories_url: string) => void;
  fetchBranchOptions: (repository_url: string) => void;
  organizationOptions: IDropdownOption[];
  repositoryOptions: IDropdownOption[];
  branchOptions: IDropdownOption[];
  gitHubAccountStatusMessage?: string;
  gitHubUser?: GitHubUser;
}

export interface DeploymentProperties {
  id: string;
  status: DeploymentStatus;
  status_text: string;
  author_email: string;
  author: string;
  deployer: string;
  message: string;
  progress: string;
  received_time: string;
  start_time: string;
  complete: boolean;
  active: string;
  is_temp: boolean;
  is_readonly: boolean;
  url: Uri;
  log_url: Uri;
  site_name: string;
  end_time?: string;
  last_success_end_time?: string;
}

export interface DeploymentLogsItem {
  log_time: string;
  id: string;
  message: string;
  details_url: string;
}

export interface SourceControlProperties {
  deploymentRollbackEnabled: boolean;
  repoUrl: string;
  branch: string;
  isMercurial: boolean;
  isGitHubAction?: boolean;
}

export interface DateTimeObj {
  rawTime: moment.Moment;
}

export interface CodeDeploymentsRow {
  index: number;
  rawTime: moment.Moment;
  displayTime: string;
  commit: JSX.Element;
  checkinMessage: string;
  status: string;
}

export interface BuildDropdownOption extends IDropdownOption {
  buildType: BuildProvider;
}

export interface RuntimeStackSetting {
  runtimeStack: string;
  runtimeVersion: string;
}
