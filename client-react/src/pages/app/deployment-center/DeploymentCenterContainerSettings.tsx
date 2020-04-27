import React from 'react';
import { FormikProps } from 'formik';
import { DeploymentCenterFormValues } from './DeploymentCenter.types';

interface DeploymentCenterContainerSettingsProps {
  resourceId: string;
  formValues: FormikProps<DeploymentCenterFormValues>;
}

const DeploymentCenterContainerSettings: React.FC<DeploymentCenterContainerSettingsProps> = props => {
  const { resourceId, formValues } = props;

  return (
    <h2>
      Settings for {resourceId}, form values received {formValues ? 'yes' : 'no'}
    </h2>
  );
};

export default DeploymentCenterContainerSettings;
