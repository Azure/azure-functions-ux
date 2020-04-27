import { ArmObj } from '../../../models/arm-obj';
import { PublishingCredentials, PublishingUser, PublishingProfile } from '../../../models/site/publish';
import { FormikActions } from 'formik';

export interface DeploymentCenterFormValues {
  hasWritePermission: boolean;
  publishingCredentials: ArmObj<PublishingCredentials> | undefined;
  publishingUser: ArmObj<PublishingUser> | undefined;
  ftpPublishingProfile: PublishingProfile | undefined;
}

export interface DeploymentCenterFormProps {
  resourceId: string;
  initialValues: DeploymentCenterFormValues | null;
  refreshSettings: () => void;
  onSubmit: (values: DeploymentCenterFormValues, actions: FormikActions<DeploymentCenterFormValues>) => void;
}
