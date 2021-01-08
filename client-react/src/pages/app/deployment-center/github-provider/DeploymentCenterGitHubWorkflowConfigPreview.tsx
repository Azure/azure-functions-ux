import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterGitHubWorkflowConfigPreviewProps } from '../DeploymentCenter.types';
import { PanelType, DefaultButton, MessageBarType, PrimaryButton } from 'office-ui-fabric-react';
import CustomPanel from '../../../../components/CustomPanel/CustomPanel';
import { panelBanner, deploymentCenterConsole, closePreviewButtonStyle, titleWithPaddingStyle } from '../DeploymentCenter.styles';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { ThemeContext } from '../../../../ThemeContext';

const DeploymentCenterGitHubWorkflowConfigPreview: React.FC<DeploymentCenterGitHubWorkflowConfigPreviewProps> = props => {
  const { isPreviewFileButtonDisabled, getWorkflowFileContent, workflowFilePath, panelMessage } = props;
  const { t } = useTranslation();

  const theme = useContext(ThemeContext);

  const [isPreviewPanelOpen, setIsPreviewPanelOpen] = useState<boolean>(false);
  const [showInfoBanner, setShowInfoBanner] = useState(true);

  const closeInfoBanner = () => {
    setShowInfoBanner(false);
  };

  const dismissPreviewPanel = () => {
    setIsPreviewPanelOpen(false);
  };

  const workflowFileContent = getWorkflowFileContent();

  return (
    <>
      <h3 className={titleWithPaddingStyle}>{t('deploymentCenterSettingsWorkflowConfigTitle')}</h3>
      <p>{t('deploymentCenterSettingsWorkflowConfigPreviewDescription')}</p>
      <DefaultButton
        text={t('deploymentCenterSettingsWorkflowConfigPreviewFileButtonText')}
        ariaLabel={t('deploymentCenterSettingsWorkflowConfigPreviewFileButtonText')}
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

          {workflowFileContent && <pre className={deploymentCenterConsole(theme)}>{workflowFileContent}</pre>}

          <PrimaryButton className={closePreviewButtonStyle} text={t('Close')} onClick={dismissPreviewPanel} ariaLabel={t('Close')} />
        </CustomPanel>
      )}
    </>
  );
};

export default DeploymentCenterGitHubWorkflowConfigPreview;
