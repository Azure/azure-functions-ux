import { ArmObj } from '../../../models/arm-obj';
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

export type DeploymentCenterContainerProps = DeploymentCenterContainerLogsProps & DeploymentCenterFtpsProps;

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

export interface DeploymentCenterFtpsProps extends DeploymentCenterFieldProps {
  resetApplicationPassword: () => void;
  publishingCredentials?: ArmObj<PublishingCredentials>;
  publishingUser?: ArmObj<PublishingUser>;
  publishingProfile?: PublishingProfile;
}

export interface DeploymentCenterContainerFormProps extends DeploymentCenterContainerProps {
  formData?: DeploymentCenterFormData;
  formValidationSchema?: DeploymentCenterYupValidationSchemaType;
  managePublishProfileFunction: () => void;
}

export interface DeploymentCenterCommandBarProps {
  saveFunction: () => void;
  discardFunction: () => void;
  managePublishProfileFunction: () => void;
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
