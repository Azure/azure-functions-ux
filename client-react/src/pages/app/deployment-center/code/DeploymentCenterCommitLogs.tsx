import React, { useEffect, useState } from 'react';
import { DeploymentCenterCommitLogsProps, DeploymentLogsItem } from '../DeploymentCenter.types';
import DeploymentCenterData from '../DeploymentCenter.data';
import { ArmArray, ArmObj } from '../../../../models/arm-obj';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import { useTranslation } from 'react-i18next';
import { ProgressIndicator, IColumn, Link } from 'office-ui-fabric-react';
import { deploymentCenterLogsError, deploymentCenterConsole } from '../DeploymentCenter.styles';
import DisplayTableWithEmptyMessage from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import moment from 'moment';

const DeploymentCenterCommitLogs: React.FC<DeploymentCenterCommitLogsProps> = props => {
  const { commitId } = props;
  const { t } = useTranslation();
  const deploymentCenterData = new DeploymentCenterData();
  const [logItems, setLogItems] = useState<ArmArray<DeploymentLogsItem> | undefined>(undefined);
  const [logItemsError, setLogItemsError] = useState<string | undefined>(undefined);
  const [displayingDetails, setDisplayingDetails] = useState<boolean>(false);
  const [logDetails, setLogDetails] = useState<string | undefined>(undefined);

  const fetchDeploymentLogs = async (commitIdString: string) => {
    const commitLogsResponse = await deploymentCenterData.getDeploymentLogs(commitIdString);

    if (commitLogsResponse.metadata.success) {
      setLogItems(commitLogsResponse.data);
    } else {
      const errorMessage = getErrorMessage(commitLogsResponse.metadata.error);
      setLogItemsError(
        errorMessage ? t('deploymentCenterCodeLogActivityFailedWithError').format(errorMessage) : t('deploymentCenterCodeLogActivityFailed')
      );
    }
  };

  const showLogDetails = async (commitIdString: string, logId: string) => {
    setDisplayingDetails(true);
    setLogDetails(undefined);

    const deploymentLogDetailsResponse = await deploymentCenterData.getLogDetails(commitIdString, logId);

    if (deploymentLogDetailsResponse.metadata.success) {
      // NOTE (t-kakan): deploymentLogDetailsResponse give an array of messages rather than single message
      const detailsString = deploymentLogDetailsResponse.data.value.map(detailsElement => {
        return detailsElement.properties.message;
      });
      setLogDetails(detailsString.join('\r\n'));
    } else {
      const errorMessage = getErrorMessage(deploymentLogDetailsResponse.metadata.error);
      setLogDetails(
        errorMessage ? t('deploymentCenterCodeLogDetailsFailedWithError').format(errorMessage) : t('deploymentCenterCodeLogDetailsFailed')
      );
    }
  };

  const getShowDetailsLink = (commitIdString: string, logItem: ArmObj<DeploymentLogsItem>) => {
    return logItem.properties.details_url ? (
      <Link href={`#${logItem.properties.id}`} onClick={() => showLogDetails(commitIdString, logItem.properties.id)}>
        {t('showLogs')}
      </Link>
    ) : (
      ''
    );
  };

  const getLogDisplayItem = (commitIdString: string, logItem: ArmObj<DeploymentLogsItem>) => {
    return {
      // NOTE (t-kakan): A is AM/PM
      displayTime: moment(logItem.properties.log_time).format('h:mm:ss A'),
      activity: logItem.properties.message,
      log: getShowDetailsLink(commitIdString, logItem),
    };
  };

  useEffect(() => {
    if (commitId) {
      fetchDeploymentLogs(commitId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commitId]);

  const logDisplayItems = logItems && commitId ? logItems.value.map(logItem => getLogDisplayItem(commitId, logItem)) : [];

  const columns: IColumn[] = [
    { key: 'displayTime', name: t('time'), fieldName: 'displayTime', minWidth: 100 },
    { key: 'activity', name: t('activity'), fieldName: 'activity', minWidth: 250, isMultiline: true },
    { key: 'log', name: t('log'), fieldName: 'log', minWidth: 150 },
  ];

  const getCommitIdHeader = () => {
    if (commitId) {
      return <p>{`${t('commitId')}: ${commitId.split('/')[commitId.split('/').length - 1]}`}</p>;
    }
  };

  return (
    <>
      {logItemsError ? (
        <pre className={deploymentCenterLogsError}>{logItemsError}</pre>
      ) : logItems ? (
        <>
          <h3>{t('logDetailsHeader')}</h3>
          {getCommitIdHeader()}
          <DisplayTableWithEmptyMessage columns={columns} items={logDisplayItems} selectionMode={0} layoutMode={1} constrainMode={0} />
          {displayingDetails && <pre className={deploymentCenterConsole}>{logDetails ? logDetails : t('resourceSelect')}</pre>}
        </>
      ) : (
        <ProgressIndicator
          description={t('deploymentCenterCodeDeploymentLogActivityLoading')}
          ariaValueText={t('deploymentCenterCodeDeploymentLogActivityLoadingAriaValue')}
        />
      )}
    </>
  );
};

export default DeploymentCenterCommitLogs;
