import React from 'react';
import { Panel, PanelType } from 'office-ui-fabric-react';
import { DeploymentCenterPublishProfilePanelProps } from '../DeploymentCenter.types';
import { useTranslation } from 'react-i18next';
import DeploymentCenterPublishProfileCommandBar from './DeploymentCenterPublishProfileCommandBar';

const DeploymentCenterPublishProfilePanel: React.FC<DeploymentCenterPublishProfilePanelProps> = props => {
  const { isPanelOpen: isOpen, dismissPanel, resetApplicationPassword } = props;
  const { t } = useTranslation();

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={dismissPanel}
      type={PanelType.medium}
      closeButtonAriaLabel={t('close')}
      headerText={t('managePublishProfile')}>
      <DeploymentCenterPublishProfileCommandBar resetApplicationPassword={resetApplicationPassword} />

      <p>{t('deploymentCenterPublishProfileDescription')}</p>
    </Panel>
  );
};

export default DeploymentCenterPublishProfilePanel;
