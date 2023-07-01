import React from 'react';
import { useTranslation } from 'react-i18next';

import { PanelType, PrimaryButton } from '@fluentui/react';

import CustomPanel from '../../../../components/CustomPanel/CustomPanel';
import { closePublishProfileButtonStyle, panelOverflowStyle } from '../DeploymentCenter.styles';
import { DeploymentCenterPublishProfilePanelProps } from '../DeploymentCenter.types';

import DeploymentCenterPublishProfileCommandBar from './DeploymentCenterPublishProfileCommandBar';

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

      <PrimaryButton className={closePublishProfileButtonStyle} text={t('Close')} onClick={dismissPanel} ariaLabel={t('Close')} />
    </CustomPanel>
  );
};

export default DeploymentCenterPublishProfilePanel;
