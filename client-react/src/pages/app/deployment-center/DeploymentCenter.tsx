import React from 'react';
import { commandBarSticky, pivotContent } from './DeploymentCenter.styles';
import DeploymentCenterCommandBar from './DeploymentCenterCommandBar';
import MonacoEditor from '../../../components/monaco-editor/monaco-editor';
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
          managePublishProfileFunction={managePublishProfileFunction}
          refreshFunction={refreshFunction}
        />
      </div>
      <div>
        <h2>Deployment Center Preview for {resourceId}</h2>
        <MonacoEditor value={''} language={'json'} />
      <div className={pivotContent}>
        <DeploymentCenterPivot resourceId={resourceId} />
      </div>
    </>
  );
};

export default DeploymentCenter;
