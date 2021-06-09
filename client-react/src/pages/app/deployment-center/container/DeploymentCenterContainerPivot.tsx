import React, { useContext } from 'react';
import { Pivot, PivotItem, IPivotItemProps, MessageBar, MessageBarType, Link } from 'office-ui-fabric-react';
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
import { PortalContext } from '../../../../PortalContext';
import { SiteStateContext } from '../../../../SiteState';
import { ArmPlanDescriptor } from '../../../../utils/resourceDescriptors';
import { messageBannerClass } from '../../../../components/CustomBanner/CustomBanner.styles';
import DeploymentCenterGitHubActionsCodeLogs from '../code/DeploymentCenterGitHubActionsCodeLogs';
import { isFtpsDirty, isSettingsDirty } from '../utility/DeploymentCenterUtility';

const DeploymentCenterContainerPivot: React.FC<DeploymentCenterContainerPivotProps> = props => {
  const { logs, formProps, isDataRefreshing, isLogsDataRefreshing, refresh, isCalledFromContainerSettings } = props;
  const { t } = useTranslation();

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);
  const theme = useContext(ThemeContext);
  const portalContext = useContext(PortalContext);
  const siteStateContext = useContext(SiteStateContext);

  const isScmGitHubActions =
    deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType === ScmType.GitHubAction;

  const openContainerSettingsBlade = () => {
    const serverFarmId = siteStateContext.site && siteStateContext.site.properties ? siteStateContext.site.properties.serverFarmId : '';
    const subscriptionId = serverFarmId ? new ArmPlanDescriptor(serverFarmId).subscription : '';

    portalContext.openBlade(
      {
        detailBlade: 'ContainerSettingsFrameBlade',
        detailBladeInputs: {
          id: deploymentCenterContext.resourceId,
          data: {
            resourceId: deploymentCenterContext.resourceId,
            isFunctionApp: siteStateContext.isFunctionApp,
            subscriptionId: subscriptionId,
            location: siteStateContext.site ? siteStateContext.site.location : '',
            os: siteStateContext.isLinuxApp ? 'linux' : 'windows',
            fromMenu: true,
            containerFormData: null,
          },
        },
        extension: 'WebsitesExtension',
      },
      'containerSettings'
    );
  };

  const isSettingsTabDirty = () => {
    return isSettingsDirty(formProps, deploymentCenterContext);
  };

  const isFtpsTabDirty = () => {
    return isFtpsDirty(formProps, deploymentCenterPublishingContext);
  };

  return (
    <>
      {isCalledFromContainerSettings && (
        <MessageBar messageBarType={MessageBarType.info} isMultiline={false} className={messageBannerClass(theme, MessageBarType.info)}>
          {t('deploymentCenterContainerSettingsBannerMessage')}
          <Link onClick={openContainerSettingsBlade}>{t('deploymentCenterContainerSettingsBannerClickHere')}</Link>
        </MessageBar>
      )}
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
