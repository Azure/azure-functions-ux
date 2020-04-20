import React from 'react';
import { Pivot, PivotItem } from 'office-ui-fabric-react';
import DeploymentCenterContainerLogs from './DeploymentCenterContainerLogs';
import DeploymentCenterContainerSettings from './DeploymentCenterContainerSettings';
import DeploymentCenterFtps from './DeploymentCenterFtps';
import { useTranslation } from 'react-i18next';

interface DeploymentCenterPivotProps {
  resourceId: string;
}

const DeploymentCenterPivot: React.FC<DeploymentCenterPivotProps> = props => {
  const { resourceId } = props;
  const { t } = useTranslation();

  return (
    <Pivot>
      <PivotItem
        headerText={t('deploymentCenterPivotItemContainerLogsHeaderText')}
        ariaLabel={t('deploymentCenterPivotItemContainerLogsAriaLabel')}>
        <DeploymentCenterContainerLogs resourceId={resourceId} />
      </PivotItem>

      <PivotItem
        headerText={t('deploymentCenterPivotItemContainerSettingsHeaderText')}
        ariaLabel={t('deploymentCenterPivotItemContainerSettingsAriaLabel')}>
        <DeploymentCenterContainerSettings resourceId={resourceId} />
      </PivotItem>

      <PivotItem headerText={t('deploymentCenterPivotItemFtpsHeaderText')} ariaLabel={t('deploymentCenterPivotItemFtpsAriaLabel')}>
        <DeploymentCenterFtps resourceId={resourceId} />
      </PivotItem>
    </Pivot>
  );
};

export default DeploymentCenterPivot;
