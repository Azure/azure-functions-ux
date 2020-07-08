import React from 'react';
import { Pivot, PivotItem } from 'office-ui-fabric-react';
import DeploymentCenterContainerSettings from './DeploymentCenterContainerSettings';
import DeploymentCenterFtps from '../DeploymentCenterFtps';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterContainerPivotProps } from '../DeploymentCenter.types';
import DeploymentCenterContainerLogs from './DeploymentCenterContainerLogs';

const DeploymentCenterContainerPivot: React.FC<DeploymentCenterContainerPivotProps> = props => {
  const { logs, publishingCredentials, publishingProfile, publishingUser, formProps, resetApplicationPassword, isLoading } = props;
  const { t } = useTranslation();

  return (
    <Pivot>
      <PivotItem headerText={t('deploymentCenterPivotItemLogsHeaderText')} ariaLabel={t('deploymentCenterPivotItemLogsAriaLabel')}>
        <DeploymentCenterContainerLogs logs={logs} isLoading={isLoading} />
      </PivotItem>

      <PivotItem headerText={t('deploymentCenterPivotItemSettingsHeaderText')} ariaLabel={t('deploymentCenterPivotItemSettingsAriaLabel')}>
        <DeploymentCenterContainerSettings formProps={formProps} />
      </PivotItem>

      <PivotItem headerText={t('deploymentCenterPivotItemFtpsHeaderText')} ariaLabel={t('deploymentCenterPivotItemFtpsAriaLabel')}>
        <DeploymentCenterFtps
          formProps={formProps}
          resetApplicationPassword={resetApplicationPassword}
          publishingCredentials={publishingCredentials}
          publishingProfile={publishingProfile}
          publishingUser={publishingUser}
          isLoading={isLoading}
        />
      </PivotItem>
    </Pivot>
  );
};

export default DeploymentCenterContainerPivot;
