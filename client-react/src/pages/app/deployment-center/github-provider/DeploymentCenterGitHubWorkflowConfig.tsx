import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { WorkflowOption, DeploymentCenterFieldProps, WorkflowDropdownOption } from '../DeploymentCenter.types';
import { PanelType, DefaultButton } from 'office-ui-fabric-react';
import CustomPanel from '../../../../components/CustomPanel/CustomPanel';

const DeploymentCenterGitHubWorkflowConfig: React.FC<DeploymentCenterFieldProps> = props => {
  const { formProps } = props;
  const { t } = useTranslation();

  const [isPreviewPanelOpen, setIsPreviewPanelOpen] = useState<boolean>(false);

  const dismissPreviewPanel = () => {
    setIsPreviewPanelOpen(false);
  };

  return (
    <>
      <h3>{t('deploymentCenterSettingsWorkflowConfigTitle')}</h3>
      <p>{t('deploymentCenterSettingsWorkflowConfigPreviewDescription')}</p>
      <DefaultButton text={t('deploymentCenterSettingsWorkflowConfigPreviewFileButtonText')} onClick={() => setIsPreviewPanelOpen(true)} />
      <CustomPanel isOpen={isPreviewPanelOpen} onDismiss={dismissPreviewPanel} type={PanelType.medium}>
        <h1>Hello</h1>
      </CustomPanel>
    </>
  );
};

export default DeploymentCenterGitHubWorkflowConfig;
