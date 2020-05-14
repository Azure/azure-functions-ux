import React from 'react';
import { DeploymentCenterPublishProfilePanelProps } from '../DeploymentCenter.types';
import { useTranslation } from 'react-i18next';
import DeploymentCenterPublishProfileCommandBar from './DeploymentCenterPublishProfileCommandBar';
import Panel from '../../../../components/Panel/Panel';
import { PanelType } from 'office-ui-fabric-react';

const DeploymentCenterPublishProfilePanel: React.FC<DeploymentCenterPublishProfilePanelProps> = props => {
  const { isPanelOpen: isOpen, dismissPanel, resetApplicationPassword } = props;
  const { t } = useTranslation();

  return (
    <Panel isOpen={isOpen} onDismiss={dismissPanel} type={PanelType.medium} headerText={t('managePublishProfile')}>
      <DeploymentCenterPublishProfileCommandBar resetApplicationPassword={resetApplicationPassword} />

      <p>{t('deploymentCenterPublishProfileDescription')}</p>
    </Panel>
  );
};

export default DeploymentCenterPublishProfilePanel;
