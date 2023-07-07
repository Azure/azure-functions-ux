import React, { useContext } from 'react';
import { Pivot, PivotItem, IPivotItemProps } from '@fluentui/react';
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
import { getTelemetryInfo, isFtpsDirty, isSettingsDirty } from '../utility/DeploymentCenterUtility';
import { PortalContext } from '../../../../PortalContext';
import { CommonConstants } from '../../../../utils/CommonConstants';
import { getSubscriptionFromResourceId } from '../../../../utils/arm-utils';

const DeploymentCenterContainerPivot: React.FC<DeploymentCenterContainerPivotProps> = props => {
  const { logs, formProps, isDataRefreshing, isLogsDataRefreshing, refresh, tab } = props;
  const { t } = useTranslation();
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);
  const theme = useContext(ThemeContext);
  const siteStateContext = useContext(SiteStateContext);
  const portalContext = useContext(PortalContext);

  const isScmGitHubActions =
    deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType === ScmType.GitHubAction;

  const onLinkClick = (item: PivotItem) => {
    if (item.props.itemKey) {
      const subscriptionId = siteStateContext.site ? getSubscriptionFromResourceId(siteStateContext.site.id) : '';
      const data = {
        tabName: item.props.itemKey,
        subscriptionId: subscriptionId,
        publishType: CommonConstants.Kinds.container,
        appType: siteStateContext.isFunctionApp ? CommonConstants.Kinds.functionApp : CommonConstants.Kinds.webApp,
      };
      portalContext.log(getTelemetryInfo('info', 'tabClicked', 'clicked', data));
    }
  };

  const isSettingsTabDirty = () => {
    return isSettingsDirty(formProps, deploymentCenterContext);
  };

  const isFtpsTabDirty = () => {
    return isFtpsDirty(formProps, deploymentCenterPublishingContext);
  };

  return (
    <>
      <Pivot onLinkClick={onLinkClick} defaultSelectedKey={tab ?? 'settings'}>
        <PivotItem
          itemKey="settings"
          headerText={t('deploymentCenterPivotItemSettingsHeaderText')}
          ariaLabel={t('deploymentCenterPivotItemSettingsAriaLabel')}
          onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
            CustomTabRenderer(link, defaultRenderer, theme, isSettingsTabDirty, t('modifiedTag'))
          }>
          <DeploymentCenterContainerSettings formProps={formProps} isDataRefreshing={isDataRefreshing} />
        </PivotItem>

        {!siteStateContext.isKubeApp && (
          <PivotItem
            itemKey="logs"
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
            itemKey="githublogs"
            headerText={t('deploymentCenterPivotItemBuildLogsHeaderText')}
            ariaLabel={t('deploymentCenterPivotItemBuildLogsAriaLabel')}>
            <DeploymentCenterGitHubActionsCodeLogs
              isLogsDataRefreshing={isLogsDataRefreshing}
              refreshLogs={() => {
                /** @note (joechung): Do nothing when refreshing logs. */
              }}
            />
          </PivotItem>
        )}

        <PivotItem
          itemKey="ftps"
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
