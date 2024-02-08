import React from 'react';
import { DeploymentCenterPublishProfilePanelProps } from '../DeploymentCenter.types';
import { useTranslation } from 'react-i18next';
import DeploymentCenterPublishProfileCommandBar from './DeploymentCenterPublishProfileCommandBar';
import CustomPanel from '../../../../components/CustomPanel/CustomPanel';
import { PanelType, PrimaryButton } from '@fluentui/react';
import { closePublishProfileButtonStyle, panelOverflowStyle } from '../DeploymentCenter.styles';
import ConfirmDialog from '../../../../components/ConfirmDialog/ConfirmDialog';

const DeploymentCenterPublishProfilePanel: React.FC<DeploymentCenterPublishProfilePanelProps> = props => {
  const { isBasicAuthDisabled, isPanelOpen: isOpen, dismissPanel, resetApplicationPassword } = props;
  const { t } = useTranslation();

  return isBasicAuthDisabled ? (
    <ConfirmDialog
      primaryActionButton={{
        title: t('ok'),
        onClick: dismissPanel,
      }}
      defaultActionButton={{
        title: t('cancel'),
        onClick: dismissPanel,
      }}
      hideDefaultActionButton={true}
      title={t('managePublishProfile')}
      content={t('managePublishProfileBasicAuthDisabled')}
      hidden={!isOpen}
      onDismiss={dismissPanel}
    />
  ) : (
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
