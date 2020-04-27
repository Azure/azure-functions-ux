import React from 'react';
import { Pivot, PivotItem } from 'office-ui-fabric-react';
import DeploymentCenterContainerSettings from './DeploymentCenterContainerSettings';
import DeploymentCenterFtps from './DeploymentCenterFtps';
import { useTranslation } from 'react-i18next';
import DeploymentCenterContainerLogsDataLoader from './DeploymentCenterContainerLogsDataLoader';
import { FormikProps } from 'formik';
import { DeploymentCenterFormValues } from './DeploymentCenter.types';

interface DeploymentCenterPivotProps {
  resourceId: string;
  formValues: FormikProps<DeploymentCenterFormValues>;
}

const DeploymentCenterPivot: React.FC<DeploymentCenterPivotProps> = props => {
  const { resourceId, formValues } = props;
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
        <DeploymentCenterContainerSettings resourceId={resourceId} formValues={formValues} />
      </PivotItem>

      <PivotItem headerText={t('deploymentCenterPivotItemFtpsHeaderText')} ariaLabel={t('deploymentCenterPivotItemFtpsAriaLabel')}>
        <DeploymentCenterFtps {...formValues} />
      </PivotItem>
    </Pivot>
  );
};

export default DeploymentCenterPivot;
