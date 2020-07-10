import { ArmObj, ArmArray } from '../../../models/arm-obj';
import { PublishingCredentials, PublishingUser, PublishingProfile } from '../../../models/site/publish';
import { FormikProps } from 'formik';
import * as Yup from 'yup';
import { ScmType, BuildProvider } from '../../../models/site/config';
import moment from 'moment';
import { Uri } from 'monaco-editor';
import { GitHubUser } from '../../../models/github';
import { IDropdownOption, IChoiceGroupOption } from 'office-ui-fabric-react';

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

export enum WorkflowOption {
  None = 'none',
  Overwrite = 'overwrite',
  Add = 'add',
  UseAvailableWorkflowConfigs = 'useAvailableWorkflowConfigs',
  UseExistingWorkflowConfig = 'useExistingWorkflowConfig',
}

export enum WorkflowFileDeleteOptions {
  Preserve = 'Preserve',
  Delete = 'Delete',
}

export type DeploymentCenterContainerProps = DeploymentCenterContainerLogsProps & DeploymentCenterFtpsProps;

export type DeploymentCenterCodeProps = DeploymentCenterCodeLogsProps & DeploymentCenterFtpsProps;

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
  workflowOption: string;
  org: string;
  repo: string;
  branch: string;
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
  scmType: ScmType;
}

export interface DeploymentCenterCodeFormData {
  sourceProvider: ScmType;
  buildProvider: BuildProvider;
  runtimeStack: string;
  runtimeVersion: string;
  runtimeRecommendedVersion: string;
  gitHubPublishProfileSecretGuid: string;
}

export interface DeploymentCenterFieldProps<T = DeploymentCenterContainerFormData | DeploymentCenterCodeFormData> {
  formProps: FormikProps<DeploymentCenterFormData<T>>;
}

export interface DeploymentCenterGitHubWorkflowConfigSelectorProps<T = DeploymentCenterContainerFormData | DeploymentCenterCodeFormData>
  extends DeploymentCenterFieldProps<T> {
  setGithubActionExistingWorkflowContents: (active: string) => void;
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

export interface DeploymentCenterGitHubWorkflowConfigPreviewProps {
  isPreviewFileButtonEnabled: () => boolean;
  getPreviewPanelContent: () => JSX.Element | undefined;
  workflowFilePath: string;
}

export interface DeploymentCenterFtpsProps {
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

export type DeploymentCenterContainerFormProps = DeploymentCenterContainerProps &
  DeploymentCenterFormProps<DeploymentCenterContainerFormData>;

export type DeploymentCenterContainerPivotProps = DeploymentCenterContainerFormProps &
  DeploymentCenterFieldProps<DeploymentCenterContainerFormData>;

export type DeploymentCenterCodeFormProps = DeploymentCenterCodeProps & DeploymentCenterFormProps<DeploymentCenterCodeFormData>;

export type DeploymentCenterCodePivotProps = DeploymentCenterCodeFormProps & DeploymentCenterFieldProps<DeploymentCenterCodeFormData>;

export interface DeploymentCenterCommandBarProps {
  isLoading: boolean;
  saveFunction: () => void;
  discardFunction: () => void;
  showPublishProfilePanel: () => void;
  refresh: () => void;
}

export interface DeploymentCenterCodeCommandBarProps extends DeploymentCenterFieldProps<DeploymentCenterCodeFormData> {
  isLoading: boolean;
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
  fetchBranchOptions: (org: string, repo: string) => void;
  organizationOptions: IDropdownOption[];
  repositoryOptions: IDropdownOption[];
  branchOptions: IDropdownOption[];
  gitHubAccountStatusMessage?: string;
  gitHubUser?: GitHubUser;
}

export interface DeploymentCenterGitHubDisconnectProps {
  branch: string;
  org: string;
  repo: string;
  repoUrl: string;
}

export interface DeploymentCenterCodeBuildCalloutProps {
  selectedBuildChoice: BuildProvider;
  updateSelectedBuildChoiceOption: (e: any, option: BuildChoiceGroupOption) => void;
  calloutOkButtonDisabled: boolean;
  toggleIsCalloutVisible: () => void;
  updateSelectedBuild: () => void;
}

export interface AuthorizationResult {
  timerId: NodeJS.Timeout;
  redirectUrl?: string;
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

export interface BuildChoiceGroupOption extends IChoiceGroupOption {
  buildType: BuildProvider;
}

export interface WorkflowDropdownOption extends IDropdownOption {
  workflowOption: WorkflowOption;
}

export interface RuntimeStackSetting {
  runtimeStack: string;
  runtimeVersion: string;
}

export class WorkflowInformation {
  fileName: string;
  secretName: string;
  content: string;
}

export interface DeploymentDisconnectStatus {
  step: DeployDisconnectStep;
  isSuccessful: boolean;
  errorMessage?: string;
  error?: any;
}

export enum DeployDisconnectStep {
  DeleteWorkflowFile = 'DeleteWorkflowFile',
  ClearSCMSettings = 'ClearSCMSettings',
}

export interface WorkflowChoiceGroupOption extends IChoiceGroupOption {
  workflowDeleteChoice: WorkflowFileDeleteOptions;
}

export interface SiteSourceControlRequestBody {
  repoUrl: string;
  branch: string;
  isManualIntegration: boolean;
  isGitHubAction: boolean;
  isMercurial: boolean;
}
