import { ArmArray } from '../../../models/arm-obj';
import { FormikProps } from 'formik';
import * as Yup from 'yup';
import { ScmType, BuildProvider } from '../../../models/site/config';
import moment from 'moment';
import { Uri } from 'monaco-editor';
import { GitHubUser } from '../../../models/github';
import { IDropdownOption, IChoiceGroupOption, MessageBarType } from 'office-ui-fabric-react';
import { BitbucketUser } from '../../../models/bitbucket';
import { RepoTypeOptions } from '../../../models/external';
import { OneDriveUser } from '../../../models/onedrive';
import { DropboxUser } from '../../../models/dropbox';

export enum SourceControlOptions {
  GitHub = 'github',
  Bitbucket = 'bitbucket',
  OneDrive = 'onedrive',
  Dropbox = 'dropbox',
}

export enum ContainerOptions {
  docker = 'docker',
  compose = 'compose',
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

export enum ContinuousDeploymentOption {
  on = 'on',
  off = 'off',
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

export enum RuntimeStackOptions {
  Java = 'java',
  Python = 'python',
  DotNetCore = 'dotnetcore',
  Ruby = 'ruby',
  Java11 = 'java-11',
  Java8 = 'java-8',
  JBossEAP = 'jbosseap',
  Node = 'node',
  PHP = 'php',
  AspDotNet = 'asp.net',
  Dotnet = 'dotnet',
}

export enum RuntimeStackDisplayNames {
  Java = 'Java',
  Python = 'Python',
  DotNetCore = '.NET Core',
  Ruby = 'Ruby',
  Java11 = 'Java 11',
  Java8 = 'Java 8',
  Node = 'Node',
  PHP = 'PHP',
  AspDotNet = 'ASP.NET',
  Dotnet = 'Dotnet',
}

export enum RuntimeVersionOptions {
  Java11 = 'java11',
  Java8 = 'java8',
}

export enum RuntimeVersionDisplayNames {
  Java11 = 'Java 11',
  Java8 = 'Java 8',
}

export enum TargetAzDevDeployment {
  Devfabric = 'devfabric',
  Preflight = 'pf',
  SU2 = 'su2',
}

export enum GitHubActionRunConclusion {
  Success = 'success',
  Failure = 'failure',
  Cancelled = 'cancelled',
  Neutral = 'neutral',
  Skipped = 'skipped',
  TimedOut = 'timed_out',
  ActionRequired = 'action_required',
}

export interface AzureDevOpsUrl {
  Tfs: string;
  Sps: string;
  Aex: string;
  Rmo: string;
  PeDeploymentLevel: string;
  PeCollectionLevel: string;
}

export interface DevOpsAccount {
  AccountId: string;
  NamespaceId: string;
  AccountName: string;
  AccountType: number;
  AccountOwner: string;
  CreatedBy: string;
  CreatedDate: Date;
  AccountStatus: number;
  LastUpdatedBy: string;
  Properties: any;
  ForceMsaPassThrough: boolean;
  OrganizationName?: string;
  StatusReason?: string;
}

export interface DevOpsBuildDefinition {
  repository: DevOpsBuildDefinitionRepository;
}

export interface DevOpsBuildDefinitionRepository {
  url: string;
  name: string;
  defaultBranch: string;
}

export interface DevOpsProject {
  id: string;
  name: string;
}

export interface DevOpsRepository {
  id: string;
  name: string;
  remoteUrl: string;
  size: number;
  sshUrl: string;
  url: string;
  webUrl: string;
  project: DevOpsProject;
}

export interface DevOpsRepositories {
  count: number;
  value: DevOpsRepository[];
}

export interface DevOpsBranch {
  name: string;
  objectId: string;
  url: string;
}

export interface DevOpsBranches {
  count: number;
  value: DevOpsBranch[];
}

export interface AuthenticatedUserContext {
  authenticatedUser: AuthenticatedUser;
  authorizedUser: AuthorizedUser;
  instanceId: string;
  deploymentId: string;
  deploymentType: string;
  locationServiceData: LocationServiceData;
}

export interface AuthenticatedUser {
  id: string;
  descriptor: string;
  subjectDescriptor: string;
  providerDisplayName: string;
  isActive: boolean;
  properties: Properties;
  resourceVersion: number;
  metaTypeId: number;
}

export interface AuthorizedUser {
  id: string;
  descriptor: string;
  subjectDescriptor: string;
  providerDisplayName: string;
  isActive: boolean;
  properties: Properties;
  resourceVersion: number;
  metaTypeId: number;
}

export interface LocationServiceData {
  serviceOwner: string;
  defaultAccessMappingMoniker: string;
  lastChangeId: number;
  lastChangeId64: number;
}

export interface Properties {
  Account: Account;
}

export interface DeploymentCenterDataLoaderProps {
  resourceId: string;
}

export interface RefreshableComponent {
  refresh: () => void;
}

export type DeploymentCenterContainerProps = DeploymentCenterContainerLogsProps & DeploymentCenterFtpsProps & RefreshableComponent;

export type DeploymentCenterCodeProps = DeploymentCenterCodeLogsProps & DeploymentCenterFtpsProps & RefreshableComponent;

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
  gitHubPublishProfileSecretGuid: string;
  externalRepoType: RepoTypeOptions;
  externalUsername?: string;
  externalPassword?: string;
  gitHubUser?: GitHubUser;
  bitbucketUser?: BitbucketUser;
  oneDriveUser?: OneDriveUser;
  dropboxUser?: DropboxUser;
  folder?: string;
  devOpsProjectName?: string;
}

export interface AcrFormData {
  acrLoginServer: string;
  acrImage: string;
  acrTag: string;
  acrUsername: string;
  acrPassword: string;
  acrComposeYml: string;
  acrResourceId: string;
  acrLocation: string;
}

export interface DockerHubFormData {
  dockerHubAccessType: ContainerDockerAccessTypes;
  dockerHubImageAndTag: string;
  dockerHubUsername: string;
  dockerHubPassword: string;
  dockerHubComposeYml: string;
}

export interface PrivateRegistryFormData {
  privateRegistryServerUrl: string;
  privateRegistryImageAndTag: string;
  privateRegistryUsername: string;
  privateRegistryPassword: string;
  privateRegistryComposeYml: string;
}

export interface DeploymentCenterContainerFormData extends AcrFormData, DockerHubFormData, PrivateRegistryFormData {
  option: ContainerOptions;
  registrySource: ContainerRegistrySources;
  scmType: ScmType;
  command: string;
  gitHubContainerUsernameSecretGuid: string;
  gitHubContainerPasswordSecretGuid: string;
  continuousDeploymentOption: ContinuousDeploymentOption;
}

export interface DeploymentCenterCodeFormData {
  sourceProvider: ScmType;
  buildProvider: BuildProvider;
  runtimeStack: string;
  runtimeVersion: string;
  runtimeRecommendedVersion: string;
  javaContainer?: string;
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
  refreshLogs: () => void;
  deployments?: ArmArray<DeploymentProperties>;
  deploymentsError?: string;
  goToSettings?: () => void;
}

export interface DeploymentCenterCodeLogsTimerProps {
  refreshLogs: () => void;
}

export interface DeploymentCenterCommitLogsProps {
  dismissLogPanel: () => void;
  commitId?: string;
}

export interface DeploymentCenterGitHubWorkflowConfigPreviewProps {
  isPreviewFileButtonDisabled: boolean;
  getWorkflowFileContent: () => string;
  workflowFilePath?: string;
  panelMessage?: string;
  panelMessageType?: MessageBarType;
}

export interface DeploymentCenterFtpsProps {
  isLoading: boolean;
}

export interface DeploymentCenterFormProps<T = DeploymentCenterContainerFormData | DeploymentCenterCodeFormData> {
  isLoading: boolean;
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
  isDirty: boolean;
  isVstsBuildProvider: boolean;
  saveFunction: () => void;
  discardFunction: () => void;
  showPublishProfilePanel: () => void;
  refresh: () => void;
  redeploy?: () => void;
}

export interface DeploymentCenterCodeCommandBarProps extends DeploymentCenterFieldProps<DeploymentCenterCodeFormData> {
  isLoading: boolean;
  refresh: () => void;
  redeploy: () => void;
}

export interface DeploymentCenterContainerCommandBarProps extends DeploymentCenterFieldProps<DeploymentCenterContainerFormData> {
  isLoading: boolean;
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
  authorizeAccount: () => void;
  organizationOptions: IDropdownOption[];
  repositoryOptions: IDropdownOption[];
  branchOptions: IDropdownOption[];
  loadingOrganizations: boolean;
  loadingRepositories: boolean;
  loadingBranches: boolean;
  accountStatusMessage?: string;
  accountUser?: GitHubUser;
}

export interface DeploymentCenterGitHubDisconnectProps {
  branch: string;
  org: string;
  repo: string;
  repoUrl: string;
  formProps: FormikProps<DeploymentCenterFormData<any>>;
}

export interface DeploymentCenterCodeBuildCalloutProps {
  selectedBuildChoice: BuildProvider;
  updateSelectedBuildChoiceOption: (e: any, option: BuildChoiceGroupOption) => void;
  calloutOkButtonDisabled: boolean;
  toggleIsCalloutVisible: () => void;
  updateSelectedBuild: () => void;
  formProps: FormikProps<DeploymentCenterFormData<any>>;
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
  message: string;
  status: string;
  author: string;
}

export interface BuildChoiceGroupOption extends IChoiceGroupOption {
  buildType: BuildProvider;
}

export interface RuntimeStackSetting {
  runtimeStack: string;
  runtimeVersion: string;
}

export interface ContainerWorkflowInformation {
  fileName: string;
  content: string;
  publishingProfileSecretName: string;
  containerUsernameSecretName: string;
  containerPasswordSecretName: string;
}

export interface CodeWorkflowInformation {
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

export interface DeploymentCenterBitbucketProviderProps<T = DeploymentCenterContainerFormData | DeploymentCenterCodeFormData>
  extends DeploymentCenterFieldProps<T> {
  authorizeAccount: () => void;
  organizationOptions: IDropdownOption[];
  repositoryOptions: IDropdownOption[];
  branchOptions: IDropdownOption[];
  loadingOrganizations: boolean;
  loadingRepositories: boolean;
  loadingBranches: boolean;
  accountStatusMessage?: string;
  accountUser?: BitbucketUser;
}

export interface DeploymentCenterContainerAcrSettingsProps extends DeploymentCenterFieldProps<DeploymentCenterContainerFormData> {
  fetchImages: (loginServer: string) => void;
  fetchTags: (image: string) => void;
  acrRegistryOptions: IDropdownOption[];
  acrImageOptions: IDropdownOption[];
  acrTagOptions: IDropdownOption[];
  loadingRegistryOptions: boolean;
  loadingImageOptions: boolean;
  loadingTagOptions: boolean;
  acrStatusMessage?: string;
  acrStatusMessageType?: MessageBarType;
}

export interface DeploymentCenterOneDriveProviderProps<T = DeploymentCenterContainerFormData | DeploymentCenterCodeFormData>
  extends DeploymentCenterFieldProps<T> {
  authorizeAccount: () => void;
  folderOptions: IDropdownOption[];
  loadingFolders: boolean;
  accountStatusMessage?: string;
  accountUser?: OneDriveUser;
}

export interface DeploymentCenterDropboxProviderProps<T = DeploymentCenterContainerFormData | DeploymentCenterCodeFormData>
  extends DeploymentCenterFieldProps<T> {
  authorizeAccount: () => void;
  folderOptions: IDropdownOption[];
  loadingFolders: boolean;
  accountStatusMessage?: string;
  accountUser?: DropboxUser;
}

export interface DeploymentCenterDevOpsProviderProps<T = DeploymentCenterContainerFormData | DeploymentCenterCodeFormData>
  extends DeploymentCenterFieldProps<T> {
  organizationOptions: IDropdownOption[];
  projectOptions: IDropdownOption[];
  repositoryOptions: IDropdownOption[];
  branchOptions: IDropdownOption[];
  loadingOrganizations: boolean;
  loadingProjects: boolean;
  loadingRepositories: boolean;
  loadingBranches: boolean;
  errorMessage?: string;
}
export interface GitHubActionsCodeDeploymentsRow {
  index: number;
  rawTime: moment.Moment;
  displayTime: string;
  commit: JSX.Element;
  logSource: string;
  message: string;
  status: JSX.Element;
  commitId: string;
  author: string;
  group: number;
}

export interface GitHubActionsRun {
  cancel_url: string;
  html_url: string;
  logs_url: string;
  workflow_id: number;
  status: string;
  conclusion: string;
  created_at: string;
  updated_at: string;
  run_number: number;
  head_commit: {
    id: string;
    author: {
      name: string;
      email: string;
    };
    message: string;
  };
}
