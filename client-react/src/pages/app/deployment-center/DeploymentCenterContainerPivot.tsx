import React from 'react';
import { Pivot, PivotItem } from 'office-ui-fabric-react';
import DeploymentCenterContainerSettings from './DeploymentCenterContainerSettings';
import DeploymentCenterFtps from './DeploymentCenterFtps';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterContainerProps } from './DeploymentCenter.types';
import DeploymentCenterContainerLogs from './DeploymentCenterContainerLogs';

const DeploymentCenterContainerPivot: React.FC<DeploymentCenterContainerProps> = props => {
  const { resourceId, hasWritePermission, publishingCredentials, publishingProfile, publishingUser } = props;
  const { t } = useTranslation();

  return (
    <Pivot>
      <PivotItem
        headerText={t('deploymentCenterPivotItemContainerLogsHeaderText')}
        ariaLabel={t('deploymentCenterPivotItemContainerLogsAriaLabel')}>
        <DeploymentCenterContainerLogs logs={props.logs} />
      </PivotItem>

      <PivotItem
        headerText={t('deploymentCenterPivotItemContainerSettingsHeaderText')}
        ariaLabel={t('deploymentCenterPivotItemContainerSettingsAriaLabel')}>
        <DeploymentCenterContainerSettings hasWritePermission={hasWritePermission} resourceId={resourceId} />
      </PivotItem>

      <PivotItem headerText={t('deploymentCenterPivotItemFtpsHeaderText')} ariaLabel={t('deploymentCenterPivotItemFtpsAriaLabel')}>
        <DeploymentCenterFtps
          hasWritePermission={hasWritePermission}
          publishingCredentials={publishingCredentials}
          publishingProfile={publishingProfile}
          publishingUser={publishingUser}
        />
      </PivotItem>
    </Pivot>
  );
};

export default DeploymentCenterContainerPivot;
