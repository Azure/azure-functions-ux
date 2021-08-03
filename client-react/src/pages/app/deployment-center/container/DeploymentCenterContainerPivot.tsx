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
import { SiteStateContext } from '../../../../SiteState';
import DeploymentCenterGitHubActionsCodeLogs from '../code/DeploymentCenterGitHubActionsCodeLogs';
import { isFtpsDirty, isSettingsDirty } from '../utility/DeploymentCenterUtility';

const DeploymentCenterContainerPivot: React.FC<DeploymentCenterContainerPivotProps> = props => {
  const { logs, formProps, isDataRefreshing, isLogsDataRefreshing, refresh } = props;
  const { t } = useTranslation();

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);
  const theme = useContext(ThemeContext);
  const siteStateContext = useContext(SiteStateContext);

  const isScmGitHubActions =
    deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType === ScmType.GitHubAction;

  const isSettingsTabDirty = () => {
    return isSettingsDirty(formProps, deploymentCenterContext);
  };

  const isFtpsTabDirty = () => {
    return isFtpsDirty(formProps, deploymentCenterPublishingContext);
  };

  return (
    <>
      <Pivot>
        <PivotItem
          headerText={t('deploymentCenterPivotItemSettingsHeaderText')}
          ariaLabel={t('deploymentCenterPivotItemSettingsAriaLabel')}
          onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
            CustomTabRenderer(link, defaultRenderer, theme, isSettingsTabDirty, t('modifiedTag'))
          }>
          <DeploymentCenterContainerSettings formProps={formProps} isDataRefreshing={isDataRefreshing} />
        </PivotItem>

        {!siteStateContext.isKubeApp && (
          <PivotItem
            headerText={
              isScmGitHubActions ? t('deploymentCenterPivotItemContainerLogsHeaderText') : t('deploymentCenterPivotItemLogsHeaderText')
            }
            ariaLabel={
              isScmGitHubActions ? t('deploymentCenterPivotItemContainerLogsAriaLabel') : t('deploymentCenterPivotItemLogsAriaLabel')
            }>
            <DeploymentCenterContainerLogs logs={logs} isLogsDataRefreshing={isLogsDataRefreshing} refresh={refresh} />
          </PivotItem>
        )}

        {isScmGitHubActions && (
          <PivotItem
            headerText={t('deploymentCenterPivotItemBuildLogsHeaderText')}
            ariaLabel={t('deploymentCenterPivotItemBuildLogsAriaLabel')}>
            <DeploymentCenterGitHubActionsCodeLogs isLogsDataRefreshing={isLogsDataRefreshing} refreshLogs={() => {}} />
          </PivotItem>
        )}

        <PivotItem
          headerText={t('deploymentCenterPivotItemFtpsHeaderText')}
          ariaLabel={t('deploymentCenterPivotItemFtpsAriaLabel')}
          onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
            CustomTabRenderer(link, defaultRenderer, theme, isFtpsTabDirty, t('modifiedTag'))
          }>
          <DeploymentCenterFtps formProps={formProps} isDataRefreshing={isDataRefreshing} />
        </PivotItem>
      </Pivot>
    </>
  );
};

export default DeploymentCenterContainerPivot;
