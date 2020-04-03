import React from 'react';
import { commandBarSticky } from './DeploymentCenter.styles';
import DeploymentCenterCommandBar from './DeploymentCenterCommandBar';

interface DeploymentCenterProps {
  resourceId: string;
  loading: boolean;
  hasPermission: boolean;
}

const DeploymentCenter: React.FC<DeploymentCenterProps> = props => {
  const { loading, hasPermission, resourceId } = props;

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
    <div>
      <div id="deployment-center-command-bar" className={commandBarSticky}>
        <DeploymentCenterCommandBar
          saveFunction={saveFunction}
          discardFunction={discardFunction}
          browseFunction={browseFunction}
          managePublishProfileFunction={managePublishProfileFunction}
          refreshFunction={refreshFunction}
          loading={loading}
          hasPermission={hasPermission}
        />
      </div>

      <div>
        <h2>Deployment Center Preview for {resourceId}</h2>
      </div>
    </div>
  );
};

export default DeploymentCenter;
