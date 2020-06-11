import React from 'react';
import { Pivot, PivotItem } from 'office-ui-fabric-react';
import DeploymentCenterFtps from '../DeploymentCenterFtps';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterCodeProps } from '../DeploymentCenter.types';
import DeploymentCenterCodeLogs from './DeploymentCenterCodeLogs';
import DeploymentCenterCodeSettings from './DeploymentCenterCodeSettings';

const DeploymentCenterCodePivot: React.FC<DeploymentCenterCodeProps> = props => {
  const {
    publishingCredentials,
    publishingProfile,
    publishingUser,
    formProps,
    resetApplicationPassword,
    deployments,
    deploymentsError,
  } = props;
  const { t } = useTranslation();

  return (
    <Pivot>
      <PivotItem headerText={t('deploymentCenterPivotItemLogsHeaderText')} ariaLabel={t('deploymentCenterPivotItemLogsAriaLabel')}>
        <DeploymentCenterCodeLogs deployments={deployments} deploymentsError={deploymentsError} />
      </PivotItem>

      <PivotItem headerText={t('deploymentCenterPivotItemSettingsHeaderText')} ariaLabel={t('deploymentCenterPivotItemSettingsAriaLabel')}>
        <DeploymentCenterCodeSettings formProps={formProps} />
      </PivotItem>

      <PivotItem headerText={t('deploymentCenterPivotItemFtpsHeaderText')} ariaLabel={t('deploymentCenterPivotItemFtpsAriaLabel')}>
        <DeploymentCenterFtps
          formProps={formProps}
          resetApplicationPassword={resetApplicationPassword}
          publishingCredentials={publishingCredentials}
          publishingProfile={publishingProfile}
          publishingUser={publishingUser}
        />
      </PivotItem>
    </Pivot>
  );
};

export default DeploymentCenterCodePivot;
