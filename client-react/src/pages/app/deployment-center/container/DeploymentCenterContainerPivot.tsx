import React, { useContext } from 'react';
import { Pivot, PivotItem, IPivotItemProps } from 'office-ui-fabric-react';
import DeploymentCenterContainerSettings from './DeploymentCenterContainerSettings';
import DeploymentCenterFtps from '../DeploymentCenterFtps';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterContainerPivotProps } from '../DeploymentCenter.types';
import DeploymentCenterContainerLogs from './DeploymentCenterContainerLogs';
import { ScmType } from '../../../../models/site/config';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { DeploymentCenterPublishingContext } from '../DeploymentCenterPublishingContext';
import { ThemeContext } from '../../../../ThemeContext';
import CustomTabRenderer from '../../app-settings/Sections/CustomTabRenderer';

const DeploymentCenterContainerPivot: React.FC<DeploymentCenterContainerPivotProps> = props => {
  const { logs, formProps, isLoading } = props;
  const { t } = useTranslation();

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);
  const theme = useContext(ThemeContext);

  const settingsDirty = (): boolean => {
    return !!deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType === ScmType.None;
  };

  const ftpsDirty = (): boolean => {
    const currentUser = deploymentCenterPublishingContext.publishingUser;

    return (
      (!!currentUser && currentUser.properties.publishingUserName !== formProps.values.publishingUsername) ||
      (!!currentUser &&
        !!formProps.values.publishingPassword &&
        currentUser.properties.publishingPassword !== formProps.values.publishingPassword)
    );
  };

  return (
    <Pivot>
      <PivotItem headerText={t('deploymentCenterPivotItemLogsHeaderText')} ariaLabel={t('deploymentCenterPivotItemLogsAriaLabel')}>
        <DeploymentCenterContainerLogs logs={logs} isLoading={isLoading} />
      </PivotItem>

      <PivotItem
        headerText={t('deploymentCenterPivotItemSettingsHeaderText')}
        ariaLabel={t('deploymentCenterPivotItemSettingsAriaLabel')}
        onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
          CustomTabRenderer(link, defaultRenderer, theme, settingsDirty, t('modifiedTag'))
        }>
        <DeploymentCenterContainerSettings formProps={formProps} />
      </PivotItem>

      <PivotItem
        headerText={t('deploymentCenterPivotItemFtpsHeaderText')}
        ariaLabel={t('deploymentCenterPivotItemFtpsAriaLabel')}
        onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
          CustomTabRenderer(link, defaultRenderer, theme, ftpsDirty, t('modifiedTag'))
        }>
        <DeploymentCenterFtps formProps={formProps} isLoading={isLoading} />
      </PivotItem>
    </Pivot>
  );
};

export default DeploymentCenterContainerPivot;
