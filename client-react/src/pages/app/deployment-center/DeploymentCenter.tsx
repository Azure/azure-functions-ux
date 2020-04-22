import React from 'react';
import { commandBarSticky } from './DeploymentCenter.styles';
import DeploymentCenterCommandBar from './DeploymentCenterCommandBar';
import MonacoEditor from '../../../components/monaco-editor/monaco-editor';

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
    <div>
      <div id="deployment-center-command-bar" className={commandBarSticky}>
        <DeploymentCenterCommandBar
          saveFunction={saveFunction}
          discardFunction={discardFunction}
          browseFunction={browseFunction}
          managePublishProfileFunction={managePublishProfileFunction}
          refreshFunction={refreshFunction}
        />
      </div>

      <div>
        <h2>Deployment Center Preview for {resourceId}</h2>
        <MonacoEditor value={''} language={'json'} />
      </div>
    </div>
  );
};

export default DeploymentCenter;
