import { ArmObj } from '../../../models/arm-obj';
import { PublishingCredentials, PublishingUser, PublishingProfile } from '../../../models/site/publish';
import { FormikActions } from 'formik';

export interface DeploymentCenterFormValues {
  hasWritePermission: boolean;
  publishingCredentials?: ArmObj<PublishingCredentials>;
  publishingUser?: ArmObj<PublishingUser>;
  ftpPublishingProfile?: PublishingProfile;
}

export interface DeploymentCenterFormProps {
  resourceId: string;
  initialValues?: DeploymentCenterFormValues;
  refreshSettings: () => void;
  onSubmit: (values: DeploymentCenterFormValues, actions: FormikActions<DeploymentCenterFormValues>) => void;
}
