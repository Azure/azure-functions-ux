import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterGitHubWorkflowConfigPreviewProps } from '../DeploymentCenter.types';
import { PanelType, DefaultButton } from 'office-ui-fabric-react';
import CustomPanel from '../../../../components/CustomPanel/CustomPanel';

const DeploymentCenterGitHubWorkflowConfigPreview: React.FC<DeploymentCenterGitHubWorkflowConfigPreviewProps> = props => {
  const { isPreviewFileButtonEnabled, getPreviewPanelContent } = props;
  const { t } = useTranslation();

  const [isPreviewPanelOpen, setIsPreviewPanelOpen] = useState<boolean>(false);

  const dismissPreviewPanel = () => {
    setIsPreviewPanelOpen(false);
  };

  return (
    <>
      <h3>{t('deploymentCenterSettingsWorkflowConfigTitle')}</h3>
      <p>{t('deploymentCenterSettingsWorkflowConfigPreviewDescription')}</p>
      <DefaultButton
        text={t('deploymentCenterSettingsWorkflowConfigPreviewFileButtonText')}
        onClick={() => setIsPreviewPanelOpen(true)}
        disabled={!isPreviewFileButtonEnabled()}
      />
      {isPreviewPanelOpen && (
        <CustomPanel isOpen={isPreviewPanelOpen} onDismiss={dismissPreviewPanel} type={PanelType.medium}>
          <h1>Hello</h1>
          {getPreviewPanelContent()}
        </CustomPanel>
      )}
    </>
  );
};

export default DeploymentCenterGitHubWorkflowConfigPreview;
