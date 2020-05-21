import { ArmObj, ArmArray } from '../../../models/arm-obj';
import { PublishingCredentials, PublishingUser, PublishingProfile } from '../../../models/site/publish';
import { FormikProps } from 'formik';
import * as Yup from 'yup';
import { ScmTypes } from '../../../models/site/config';

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

export enum DeployStatus {
  Pending,
  Building,
  Deploying,
  Failed,
  Success,
}

export type DeploymentCenterContainerProps = DeploymentCenterContainerLogsProps & DeploymentCenterFtpsProps;

export type DeploymentCenterCodeProps = DeploymentCenterCodeLogsProps & DeploymentCenterFtpsProps;

export type DeploymentCenterYupValidationSchemaType = Yup.ObjectSchema<Yup.Shape<object, DeploymentCenterFormData>>;

export type DeploymentCenterFormData = DeploymentCenterCommonFormData & DeploymentCenterContainerFormData;

export interface DeploymentCenterCommonFormData {
  publishingUsername: string;
  publishingPassword: string;
  publishingConfirmPassword: string;
  scmType: ScmTypes;
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
}

export interface DeploymentCenterFieldProps {
  formProps?: FormikProps<DeploymentCenterFormData>;
}

export interface DeploymentCenterContainerLogsProps {
  logs?: string;
}

export interface DeploymentCenterCodeLogsProps {
  deployments: ArmArray<DeploymentProperties>;
}

export interface DeploymentCenterFtpsProps extends DeploymentCenterFieldProps {
  resetApplicationPassword: () => void;
  publishingCredentials?: ArmObj<PublishingCredentials>;
  publishingUser?: ArmObj<PublishingUser>;
  publishingProfile?: PublishingProfile;
}

export interface DeploymentCenterContainerFormProps extends DeploymentCenterContainerProps {
  showPublishProfilePanel: () => void;
  formData?: DeploymentCenterFormData;
  formValidationSchema?: DeploymentCenterYupValidationSchemaType;
}

export interface DeploymentCenterCodeFormProps extends DeploymentCenterCodeProps {
  showPublishProfilePanel: () => void;
  formData?: DeploymentCenterFormData;
  formValidationSchema?: DeploymentCenterYupValidationSchemaType;
}

export interface DeploymentCenterCommandBarProps {
  saveFunction: () => void;
  discardFunction: () => void;
  showPublishProfilePanel: () => void;
  refreshFunction: () => void;
}

export interface DeploymentCenterPublishProfilePanelProps {
  isPanelOpen: boolean;
  dismissPanel: () => void;
  resetApplicationPassword: () => void;
}

export interface DeploymentCenterPublishProfileCommandBarProps {
  resetApplicationPassword: () => void;
}

export interface DeploymentProperties {
  id: string;
  status: DeployStatus;
  status_text: string;
  author_email: string;
  author: string;
  deployer: string;
  message: string;
  progress: string;
  received_time: string;
  start_time: string;
  end_time: string;
  last_success_end_time: string;
  complete: string;
  active: string;
  is_temp: string;
  is_readonly: string;
  url: string;
  log_url: string;
  site_name: string;
}
