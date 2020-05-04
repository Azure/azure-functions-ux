import { ArmObj } from '../../../models/arm-obj';
import { PublishingCredentials, PublishingUser, PublishingProfile } from '../../../models/site/publish';
import { FormikProps } from 'formik';
import * as Yup from 'yup';

export type DeploymentCenterContainerProps = DeploymentCenterContainerLogsProps & DeploymentCenterFtpsProps;

export type DeploymentCenterYupValidationSchemaType = Yup.ObjectSchema<Yup.Shape<object, DeploymentCenterFormData>>;

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

export interface DeploymentCenterContainerFormProps extends DeploymentCenterContainerProps {
  formData?: DeploymentCenterFormData;
  formValidationSchema?: DeploymentCenterYupValidationSchemaType;
}

export interface DeploymentCenterCommandBarProps {
  saveFunction: () => void;
  discardFunction: () => void;
  managePublishProfileFunction: () => void;
  refreshFunction: () => void;
}
