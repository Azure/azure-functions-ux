import React from 'react';
import { Pivot, PivotItem } from 'office-ui-fabric-react';
import DeploymentCenterContainerSettings from './DeploymentCenterContainerSettings';
import DeploymentCenterFtps from './DeploymentCenterFtps';
import { useTranslation } from 'react-i18next';
import DeploymentCenterContainerLogsDataLoader from './DeploymentCenterContainerLogsDataLoader';

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
        <DeploymentCenterContainerLogsDataLoader resourceId={resourceId} />
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
