import React from 'react';
import { commandBarSticky, pivotContent } from './DeploymentCenter.styles';
import DeploymentCenterCommandBar from './DeploymentCenterCommandBar';
import DeploymentCenterPivot from './DeploymentCenterPivot';
import { FormikProps } from 'formik';
import { DeploymentCenterFormValues } from './DeploymentCenter.types';

interface DeploymentCenterProps {
  resourceId: string;
  formValues: FormikProps<DeploymentCenterFormValues>;
  saveFunction: () => void;
  refreshFunction: () => void;
}

const DeploymentCenter: React.FC<DeploymentCenterProps> = props => {
  const { resourceId, formValues, saveFunction, refreshFunction } = props;

  const discardFunction = () => {
    throw Error('Not implemented');
  };

  const managePublishProfileFunction = () => {
    throw Error('Not implemented');
  };

  return (
    <>
      <div id="deployment-center-command-bar" className={commandBarSticky}>
        <DeploymentCenterCommandBar
          saveFunction={saveFunction}
          discardFunction={discardFunction}
          managePublishProfileFunction={managePublishProfileFunction}
          refreshFunction={refreshFunction}
        />
      </div>

      <div className={pivotContent}>
        <DeploymentCenterPivot resourceId={resourceId} formValues={formValues} />
      </div>
    </>
  );
};

export default DeploymentCenter;
