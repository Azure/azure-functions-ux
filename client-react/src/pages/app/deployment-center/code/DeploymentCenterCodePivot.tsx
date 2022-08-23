import React, { useState, useContext, useEffect } from 'react';
import { Pivot, PivotItem, IPivotItemProps } from '@fluentui/react';
import DeploymentCenterFtps from '../DeploymentCenterFtps';
import { useTranslation } from 'react-i18next';
import { DeploymentCenterCodePivotProps } from '../DeploymentCenter.types';
import DeploymentCenterCodeLogs from './DeploymentCenterCodeLogs';
import DeploymentCenterCodeSettings from './DeploymentCenterCodeSettings';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { ScmType, BuildProvider } from '../../../../models/site/config';
import CustomTabRenderer from '../../app-settings/Sections/CustomTabRenderer';
import { ThemeContext } from '../../../../ThemeContext';
import { DeploymentCenterPublishingContext } from '../DeploymentCenterPublishingContext';
import { PortalContext } from '../../../../PortalContext';
import { getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { SiteStateContext } from '../../../../SiteState';
import DeploymentCenterGitHubActionsCodeLogs from './DeploymentCenterGitHubActionsCodeLogs';
import { getSubscriptionFromResourceId } from '../../../../utils/arm-utils';
import { CommonConstants } from '../../../../utils/CommonConstants';

const DeploymentCenterCodePivot: React.FC<DeploymentCenterCodePivotProps> = props => {
  const { formProps, deployments, deploymentsError, refreshLogs, isDataRefreshing, isLogsDataRefreshing, tab } = props;
  const { t } = useTranslation();
  const [selectedKey, setSelectedKey] = useState<string>(tab ?? 'settings');
  const [showLogsTab, setShowLogsTab] = useState(true);
  const [showFtpsTab, setShowFtpsTab] = useState(false);

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);
  const siteStateContext = useContext(SiteStateContext);

  const theme = useContext(ThemeContext);
  const portalContext = useContext(PortalContext);
  const scenarioService = new ScenarioService(t);

  const isScmLocalGit = deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType === ScmType.LocalGit;
  const isScmGitHubActions =
    !!deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType === ScmType.GitHubAction;

  const goToSettingsOnClick = () => {
    portalContext.log(getTelemetryInfo('info', 'goToSettingButton', 'clicked'));
    setSelectedKey('settings');
  };

  const onLinkClick = (item: PivotItem) => {
    if (item.props.itemKey) {
      setSelectedKey(item.props.itemKey);
      const subscriptionId = siteStateContext.site ? getSubscriptionFromResourceId(siteStateContext.site.id) : '';
      const data = {
        tabName: item.props.itemKey,
        subscriptionId: subscriptionId,
        publishType: CommonConstants.Kinds.code,
        appType: siteStateContext.isFunctionApp ? CommonConstants.Kinds.functionApp : CommonConstants.Kinds.webApp,
      };
      portalContext.log(getTelemetryInfo('info', 'tabClicked', 'clicked', data));
    }
  };

  const isSettingsDirty = (): boolean => {
    return (
      !!formProps.values.buildProvider &&
      formProps.values.buildProvider !== BuildProvider.None &&
      !!deploymentCenterContext.siteConfig &&
      deploymentCenterContext.siteConfig.properties.scmType === ScmType.None
    );
  };

  const isFtpsDirty = (): boolean => {
    const currentUser = deploymentCenterPublishingContext.publishingUser;
    const formPropsExist =
      (!!formProps.values.publishingUsername || formProps.values.publishingUsername === '') &&
      (!!formProps.values.publishingPassword || formProps.values.publishingPassword === '') &&
      (!!formProps.values.publishingConfirmPassword || formProps.values.publishingConfirmPassword === '');

    return (
      formPropsExist &&
      !!currentUser &&
      ((currentUser.properties.publishingUserName && !formProps.values.publishingUsername) ||
        (!!formProps.values.publishingUsername && currentUser.properties.publishingUserName !== formProps.values.publishingUsername) ||
        !!formProps.values.publishingPassword ||
        !!formProps.values.publishingConfirmPassword)
    );
  };

  const getGitHubActionsCodeLogsComponent = () => {
    return (
      <DeploymentCenterGitHubActionsCodeLogs
        goToSettings={goToSettingsOnClick}
        deployments={deployments}
        deploymentsError={deploymentsError}
        isLogsDataRefreshing={isLogsDataRefreshing}
        refreshLogs={refreshLogs}
      />
    );
  };

  const getCodeLogsComponent = () => {
    return (
      <DeploymentCenterCodeLogs
        goToSettings={goToSettingsOnClick}
        deployments={deployments}
        deploymentsError={deploymentsError}
        isLogsDataRefreshing={isLogsDataRefreshing}
        refreshLogs={refreshLogs}
      />
    );
  };

  useEffect(() => {
    portalContext.updateDirtyState(isFtpsDirty() || isSettingsDirty());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formProps.values.buildProvider,
    formProps.values.publishingUsername,
    formProps.values.publishingPassword,
    formProps.values.publishingConfirmPassword,
  ]);

  useEffect(() => {
    if (siteStateContext && siteStateContext.site) {
      const scenarioStatus = scenarioService.checkScenario(ScenarioIds.deploymentCenterLogs, { site: siteStateContext.site }).status;
      setShowLogsTab(scenarioStatus !== 'disabled' || (siteStateContext.isKubeApp && isScmGitHubActions));
    }

    if (siteStateContext && siteStateContext.site) {
      const scenarioStatus = scenarioService.checkScenario(ScenarioIds.ftpSource, { site: siteStateContext.site }).status;
      setShowFtpsTab(scenarioStatus !== 'disabled');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteStateContext.site, isScmGitHubActions]);

  return (
    <Pivot selectedKey={selectedKey} onLinkClick={onLinkClick}>
      <PivotItem
        itemKey="settings"
        headerText={t('deploymentCenterPivotItemSettingsHeaderText')}
        ariaLabel={t('deploymentCenterPivotItemSettingsAriaLabel')}
        onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
          CustomTabRenderer(link, defaultRenderer, theme, isSettingsDirty, t('modifiedTag'))
        }>
        <DeploymentCenterCodeSettings formProps={formProps} isDataRefreshing={isDataRefreshing} />
      </PivotItem>

      {showLogsTab && (
        <PivotItem
          itemKey="logs"
          headerText={t('deploymentCenterPivotItemLogsHeaderText')}
          ariaLabel={t('deploymentCenterPivotItemLogsAriaLabel')}>
          {isScmGitHubActions ? getGitHubActionsCodeLogsComponent() : getCodeLogsComponent()}
        </PivotItem>
      )}

      {showFtpsTab && (
        <PivotItem
          itemKey="ftps"
          headerText={isScmLocalGit ? t('deploymentCenterPivotItemGitFtpsHeaderText') : t('deploymentCenterPivotItemFtpsHeaderText')}
          ariaLabel={isScmLocalGit ? t('deploymentCenterPivotItemGitFtpsAriaLabel') : t('deploymentCenterPivotItemFtpsAriaLabel')}
          onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
            CustomTabRenderer(link, defaultRenderer, theme, isFtpsDirty, t('modifiedTag'))
          }>
          <DeploymentCenterFtps formProps={formProps} isDataRefreshing={isDataRefreshing} />
        </PivotItem>
      )}
    </Pivot>
  );
};

export default DeploymentCenterCodePivot;
