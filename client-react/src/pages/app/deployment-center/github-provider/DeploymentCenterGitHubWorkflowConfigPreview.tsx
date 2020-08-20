import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterGitHubWorkflowConfigPreviewProps } from '../DeploymentCenter.types';
import { PanelType, DefaultButton, MessageBarType } from 'office-ui-fabric-react';
import CustomPanel from '../../../../components/CustomPanel/CustomPanel';
import { panelBanner, deploymentCenterConsole } from '../DeploymentCenter.styles';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';

const DeploymentCenterGitHubWorkflowConfigPreview: React.FC<DeploymentCenterGitHubWorkflowConfigPreviewProps> = props => {
  const { isPreviewFileButtonDisabled, workflowFilePath, workflowFileContent, panelMessage } = props;
  const { t } = useTranslation();

  const [isPreviewPanelOpen, setIsPreviewPanelOpen] = useState<boolean>(false);
  const [showInfoBanner, setShowInfoBanner] = useState(true);

  const closeInfoBanner = () => {
    setShowInfoBanner(false);
  };

  const dismissPreviewPanel = () => {
    setIsPreviewPanelOpen(false);
  };

  return (
    <>
      <h3>{t('deploymentCenterSettingsWorkflowConfigTitle')}</h3>
      <p>{t('deploymentCenterSettingsWorkflowConfigPreviewDescription')}</p>
      <DefaultButton
        text={t('deploymentCenterSettingsWorkflowConfigPreviewFileButtonText')}
        onClick={() => {
          setIsPreviewPanelOpen(true);
          setShowInfoBanner(true);
        }}
        disabled={isPreviewFileButtonDisabled}
      />
      {isPreviewPanelOpen && (
        <CustomPanel isOpen={isPreviewPanelOpen} onDismiss={dismissPreviewPanel} type={PanelType.medium}>
          <h1>{t('deploymentCenterSettingsWorkflowConfigTitle')}</h1>
          {workflowFilePath && <p>{`${t('deploymentCenterWorkflowConfigsFilePathLabel')}: ${workflowFilePath}`}</p>}

          {showInfoBanner && panelMessage && (
            <div className={panelBanner}>
              <CustomBanner message={panelMessage} type={MessageBarType.info} onDismiss={closeInfoBanner} />
            </div>
          )}

          {workflowFileContent && <pre className={deploymentCenterConsole}>{workflowFileContent}</pre>}
        </CustomPanel>
      )}
    </>
  );
};

export default DeploymentCenterGitHubWorkflowConfigPreview;
