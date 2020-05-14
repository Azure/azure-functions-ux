import { ArmObj } from '../../../models/arm-obj';
import { PublishingCredentials, PublishingUser, PublishingProfile } from '../../../models/site/publish';
import { FormikProps } from 'formik';

export interface DeploymentCenterFormData {
  publishingUsername: string;
  publishingPassword: string;
  publishingConfirmPassword: string;
}

export interface DeploymentCenterContainerLogsProps {
  logs?: string;
}

export interface DeploymentCenterFtpsProps {
  resetApplicationPassword: () => void;
  formProps?: FormikProps<DeploymentCenterFormData>;
  publishingCredentials?: ArmObj<PublishingCredentials>;
  publishingUser?: ArmObj<PublishingUser>;
  publishingProfile?: PublishingProfile;
}

export type DeploymentCenterContainerProps = DeploymentCenterContainerLogsProps & DeploymentCenterFtpsProps;

export interface DeploymentCenterContainerFormProps extends DeploymentCenterContainerProps {
  formData?: DeploymentCenterFormData;
}
