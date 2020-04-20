import React from 'react';
import { commandBarSticky, pivotContent } from './DeploymentCenter.styles';
import DeploymentCenterCommandBar from './DeploymentCenterCommandBar';
import DeploymentCenterPivot from './DeploymentCenterPivot';

interface DeploymentCenterProps {
  resourceId: string;
}

const DeploymentCenter: React.FC<DeploymentCenterProps> = props => {
  const { resourceId } = props;

  const saveFunction = () => {
    throw Error('Not implemented');
  };

  const discardFunction = () => {
    throw Error('Not implemented');
  };

  const browseFunction = () => {
    throw Error('Not implemented');
  };

  const managePublishProfileFunction = () => {
    throw Error('Not implemented');
  };

  const refreshFunction = () => {
    throw Error('Not implemented');
  };

  return (
    <>
      <div id="deployment-center-command-bar" className={commandBarSticky}>
        <DeploymentCenterCommandBar
          saveFunction={saveFunction}
          discardFunction={discardFunction}
          browseFunction={browseFunction}
          managePublishProfileFunction={managePublishProfileFunction}
          refreshFunction={refreshFunction}
        />
      </div>

      <div className={pivotContent}>
        <DeploymentCenterPivot resourceId={resourceId} />
      </div>
    </>
  );
};

export default DeploymentCenter;
