import React, { useContext, useEffect, useState } from 'react';
import { DeploymentCenterGitHubActionRunLogsProps } from '../DeploymentCenter.types';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import DeploymentCenterData from '../DeploymentCenter.data';
import { DeploymentCenterContext } from '../DeploymentCenterContext';

const DeploymentCenterGithubActionRunLogs: React.FC<DeploymentCenterGitHubActionRunLogsProps> = props => {
  const { url } = props;
  const { t } = useTranslation();

  const [logs, setLogs] = useState<string | undefined>(undefined);
  const [logItemsError, setLogItemsError] = useState<string | undefined>(undefined);

  const deploymentCenterData = new DeploymentCenterData();
  const deploymentCenterContext = useContext(DeploymentCenterContext);

  const fetchGitHubActionRunLogs = async () => {
    if (url) {
      const workflowRunLogsResponse = await deploymentCenterData.getWorkflowRunLogs(deploymentCenterContext.gitHubToken, url);

      if (workflowRunLogsResponse.metadata.success) {
        setLogs(workflowRunLogsResponse.data);
      } else {
        const errorMessage = getErrorMessage(workflowRunLogsResponse);
        setLogItemsError(
          errorMessage
            ? t('deploymentCenterCodeLogActivityFailedWithError').format(errorMessage)
            : t('deploymentCenterCodeLogActivityFailed')
        );
      }
    }
  };

  useEffect(() => {
    if (url) {
      fetchGitHubActionRunLogs();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return (
    <>
      <h3>{t('logDetailsHeader')}</h3>
      {logItemsError ? logItemsError : logs}
    </>
  );
};

export default DeploymentCenterGithubActionRunLogs;
