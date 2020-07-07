import React, { useState } from 'react';
import { Pivot, PivotItem } from 'office-ui-fabric-react';
import DeploymentCenterFtps from '../DeploymentCenterFtps';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterCodePivotProps } from '../DeploymentCenter.types';
import DeploymentCenterCodeLogs from './DeploymentCenterCodeLogs';
import DeploymentCenterCodeSettings from './DeploymentCenterCodeSettings';

const DeploymentCenterCodePivot: React.FC<DeploymentCenterCodePivotProps> = props => {
  const {
    publishingCredentials,
    publishingProfile,
    publishingUser,
    formProps,
    resetApplicationPassword,
    deployments,
    deploymentsError,
    isLoading,
  } = props;
  const { t } = useTranslation();
  const [selectedKey, setSelectedKey] = useState<string>('logs');

  const goToSettingsOnClick = () => {
    setSelectedKey('settings');
  };

  const onLinkClick = (item: PivotItem) => {
    if (item.props.itemKey) {
      setSelectedKey(item.props.itemKey);
    }
  };

  return (
    <Pivot selectedKey={selectedKey} onLinkClick={onLinkClick}>
      <PivotItem
        itemKey="logs"
        headerText={t('deploymentCenterPivotItemLogsHeaderText')}
        ariaLabel={t('deploymentCenterPivotItemLogsAriaLabel')}>
        <DeploymentCenterCodeLogs
          goToSettings={goToSettingsOnClick}
          deployments={deployments}
          deploymentsError={deploymentsError}
          isLoading={isLoading}
        />
      </PivotItem>

      <PivotItem
        itemKey="settings"
        headerText={t('deploymentCenterPivotItemSettingsHeaderText')}
        ariaLabel={t('deploymentCenterPivotItemSettingsAriaLabel')}>
        <DeploymentCenterCodeSettings formProps={formProps} />
      </PivotItem>

      <PivotItem
        itemKey="ftps"
        headerText={t('deploymentCenterPivotItemFtpsHeaderText')}
        ariaLabel={t('deploymentCenterPivotItemFtpsAriaLabel')}>
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

export default DeploymentCenterCodePivot;
