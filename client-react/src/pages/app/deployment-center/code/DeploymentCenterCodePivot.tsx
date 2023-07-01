import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { IPivotItemProps, Pivot, PivotItem } from '@fluentui/react';

import { BuildProvider, ScmType } from '../../../../models/site/config';
import { PortalContext } from '../../../../PortalContext';
import { SiteStateContext } from '../../../../SiteState';
import { ThemeContext } from '../../../../ThemeContext';
import { getSubscriptionFromResourceId } from '../../../../utils/arm-utils';
import { CommonConstants } from '../../../../utils/CommonConstants';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import CustomTabRenderer from '../../app-settings/Sections/CustomTabRenderer';
import { DeploymentCenterCodePivotProps } from '../DeploymentCenter.types';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import DeploymentCenterFtps from '../DeploymentCenterFtps';
import { DeploymentCenterPublishingContext } from '../DeploymentCenterPublishingContext';
import { getTelemetryInfo } from '../utility/DeploymentCenterUtility';

import DeploymentCenterCodeLogs from './DeploymentCenterCodeLogs';
import DeploymentCenterCodeSettings from './DeploymentCenterCodeSettings';
import DeploymentCenterGitHubActionsCodeLogs from './DeploymentCenterGitHubActionsCodeLogs';
import DeploymentCenterVSTSCodeLogs from './DeploymentCenterVSTSCodeLogs';

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

  const isScmLocalGit = deploymentCenterContext.siteConfig?.properties?.scmType === ScmType.LocalGit;
  const isScmGitHubActions = deploymentCenterContext.siteConfig?.properties?.scmType === ScmType.GitHubAction;
  const isScmVsts = deploymentCenterContext.siteConfig?.properties?.scmType === ScmType.Vsts;

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

  const getCodeLogs = () => {
    if (isScmGitHubActions) {
      return getGitHubActionsCodeLogsComponent();
    } else if (isScmVsts) {
      return getVstsCodeLogsComponent();
    } else {
      return getCodeLogsComponent();
    }
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

  const getVstsCodeLogsComponent = () => {
    return (
      <DeploymentCenterVSTSCodeLogs
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
  }, [siteStateContext.site, isScmGitHubActions]);

  useEffect(() => {
    const scmType = deploymentCenterContext.siteConfig?.properties?.scmType;
    const isGitHubSourceSetup = scmType === ScmType.GitHubAction || scmType === ScmType.GitHub;
    const isBitbucketSetup = scmType === ScmType.BitbucketGit;
    if (isGitHubSourceSetup || isBitbucketSetup) {
      setSelectedKey('logs');
    }
  }, [deploymentCenterContext.siteConfig?.properties?.scmType]);

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
          {getCodeLogs()}
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
