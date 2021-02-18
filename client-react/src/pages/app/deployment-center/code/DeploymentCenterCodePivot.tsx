import React, { useState, useContext, useEffect } from 'react';
import { Pivot, PivotItem, IPivotItemProps } from 'office-ui-fabric-react';
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

const DeploymentCenterCodePivot: React.FC<DeploymentCenterCodePivotProps> = props => {
  const { formProps, deployments, deploymentsError, isLoading, refreshLogs } = props;
  const { t } = useTranslation();
  const [selectedKey, setSelectedKey] = useState<string>('logs');
  const [showLogsTab, setShowLogsTab] = useState(true);

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterPublishingContext = useContext(DeploymentCenterPublishingContext);
  const siteStateContext = useContext(SiteStateContext);

  const theme = useContext(ThemeContext);
  const portalContext = useContext(PortalContext);
  const scenarioService = new ScenarioService(t);

  const isScmLocalGit = deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType === ScmType.LocalGit;
  const isScmGitHubActions =
    deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType === ScmType.GitHubAction;

  const goToSettingsOnClick = () => {
    portalContext.log(getTelemetryInfo('info', 'goToSettingButton', 'clicked'));
    setSelectedKey('settings');
  };

  const onLinkClick = (item: PivotItem) => {
    if (item.props.itemKey) {
      setSelectedKey(item.props.itemKey);
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
        (!!formProps.values.publishingPassword || !!formProps.values.publishingConfirmPassword))
    );
  };

  const getGitHubActionsCodeLogsComponent = () => {
    return (
      <DeploymentCenterGitHubActionsCodeLogs
        goToSettings={goToSettingsOnClick}
        deployments={deployments}
        deploymentsError={deploymentsError}
        isLoading={isLoading}
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
        isLoading={isLoading}
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
      setShowLogsTab(scenarioStatus !== 'disabled');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteStateContext.site]);

  return (
    <Pivot selectedKey={selectedKey} onLinkClick={onLinkClick}>
      {showLogsTab && (
        <PivotItem
          itemKey="logs"
          headerText={t('deploymentCenterPivotItemLogsHeaderText')}
          ariaLabel={t('deploymentCenterPivotItemLogsAriaLabel')}>
          {isScmGitHubActions ? getGitHubActionsCodeLogsComponent() : getCodeLogsComponent()}
        </PivotItem>
      )}

      <PivotItem
        itemKey="settings"
        headerText={t('deploymentCenterPivotItemSettingsHeaderText')}
        ariaLabel={t('deploymentCenterPivotItemSettingsAriaLabel')}
        onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
          CustomTabRenderer(link, defaultRenderer, theme, isSettingsDirty, t('modifiedTag'))
        }>
        <DeploymentCenterCodeSettings formProps={formProps} />
      </PivotItem>

      <PivotItem
        itemKey="ftps"
        headerText={isScmLocalGit ? t('deploymentCenterPivotItemGitFtpsHeaderText') : t('deploymentCenterPivotItemFtpsHeaderText')}
        ariaLabel={isScmLocalGit ? t('deploymentCenterPivotItemGitFtpsAriaLabel') : t('deploymentCenterPivotItemFtpsAriaLabel')}
        onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
          CustomTabRenderer(link, defaultRenderer, theme, isFtpsDirty, t('modifiedTag'))
        }>
        <DeploymentCenterFtps formProps={formProps} isLoading={isLoading} />
      </PivotItem>
    </Pivot>
  );
};

export default DeploymentCenterCodePivot;
