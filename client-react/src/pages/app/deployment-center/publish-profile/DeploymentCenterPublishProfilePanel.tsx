import React from 'react';
import { DeploymentCenterPublishProfilePanelProps } from '../DeploymentCenter.types';
import { useTranslation } from 'react-i18next';
import DeploymentCenterPublishProfileCommandBar from './DeploymentCenterPublishProfileCommandBar';
import CustomPanel from '../../../../components/CustomPanel/CustomPanel';
import { PanelType } from 'office-ui-fabric-react';
import { panelOverflowStyle } from '../DeploymentCenter.styles';

const DeploymentCenterPublishProfilePanel: React.FC<DeploymentCenterPublishProfilePanelProps> = props => {
  const { isPanelOpen: isOpen, dismissPanel, resetApplicationPassword } = props;
  const { t } = useTranslation();

  return (
    <CustomPanel
      customStyle={panelOverflowStyle}
      isOpen={isOpen}
      onDismiss={dismissPanel}
      type={PanelType.medium}
      headerText={t('managePublishProfile')}>
      <DeploymentCenterPublishProfileCommandBar resetApplicationPassword={resetApplicationPassword} />
      <p>{t('deploymentCenterPublishProfileDescription')}</p>
    </CustomPanel>
  );
};

export default DeploymentCenterPublishProfilePanel;
