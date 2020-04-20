import React from 'react';
import { Pivot, PivotItem } from 'office-ui-fabric-react';
import DeploymentCenterPivotItemContainerLogs from './DeploymentCenterPivotItemContainerLogs';
import DeploymentCenterPivotItemContainerSettings from './DeploymentCenterPivotItemContainerSettings';
import DeploymentCenterPivotItemFtps from './DeploymentCenterPivotItemFtps';
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
        <DeploymentCenterPivotItemContainerLogs resourceId={resourceId} />
      </PivotItem>

      <PivotItem
        headerText={t('deploymentCenterPivotItemContainerSettingsHeaderText')}
        ariaLabel={t('deploymentCenterPivotItemContainerSettingsAriaLabel')}>
        <DeploymentCenterPivotItemContainerSettings resourceId={resourceId} />
      </PivotItem>

      <PivotItem headerText={t('deploymentCenterPivotItemFtpsHeaderText')} ariaLabel={t('deploymentCenterPivotItemFtpsAriaLabel')}>
        <DeploymentCenterPivotItemFtps resourceId={resourceId} />
      </PivotItem>
    </Pivot>
  );
};

export default DeploymentCenterPivot;
