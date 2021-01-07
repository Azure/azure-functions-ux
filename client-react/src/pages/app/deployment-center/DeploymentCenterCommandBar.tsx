import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ICommandBarItemProps, CommandBar } from 'office-ui-fabric-react';
import { CommandBarStyles } from '../../../theme/CustomOfficeFabric/AzurePortal/CommandBar.styles';
import { CustomCommandBarButton } from '../../../components/CustomCommandBarButton';
import { SiteStateContext } from '../../../SiteState';
import { DeploymentCenterCommandBarProps } from './DeploymentCenter.types';
import { DeploymentCenterContext } from './DeploymentCenterContext';
import { ScmType } from '../../../models/site/config';
import { PortalContext } from '../../../PortalContext';
import { getTelemetryInfo } from './utility/DeploymentCenterUtility';
import { LogLevels } from '../../../models/telemetry';

const DeploymentCenterCommandBar: React.FC<DeploymentCenterCommandBarProps> = props => {
  const { saveFunction, discardFunction, showPublishProfilePanel, refresh, redeploy, isLoading, isDirty } = props;
  const { t } = useTranslation();
  const portalContext = useContext(PortalContext);
  const siteStateContext = useContext(SiteStateContext);
  const deploymentCenterContext = useContext(DeploymentCenterContext);

  const isSiteLoaded = () => {
    return siteStateContext.site && siteStateContext.site.properties;
  };

  const isBrowseEnabled = () => {
    return siteStateContext.site && siteStateContext.site.properties.hostNames.length > 0 && !siteStateContext.stopped;
  };

  const onBrowseClick = () => {
    const hostName = siteStateContext.site && siteStateContext.site.properties.hostNames[0];
    window.open(`https://${hostName}`);
  };

  const isDisabledOnReload = () => {
    return !isSiteLoaded() || isLoading;
  };

  const isRedeployDisabled = () => {
    return (
      isDisabledOnReload() ||
      (deploymentCenterContext.siteConfig &&
        (deploymentCenterContext.siteConfig.properties.scmType === ScmType.LocalGit ||
          deploymentCenterContext.siteConfig.properties.scmType === ScmType.Vsts ||
          deploymentCenterContext.siteConfig.properties.scmType === ScmType.None))
    );
  };

  const openFeedbackBlade = () => {
    const featureName = 'DeploymentCenter';
    portalContext.openBlade(
      {
        detailBlade: 'InProductFeedbackBlade',
        extension: 'HubsExtension',
        openAsContextBlade: true,
        detailBladeInputs: {
          bladeName: `${featureName}`,
          cesQuestion: t('deploymentCenterFeedbackCESQuestion'),
          cvaQuestion: t('deploymentCenterFeedbackCVAQuestion'),
          extensionName: 'WebsitesExtension',
          featureName: `${featureName}`,
          surveyId: `${featureName}-0920`,
        },
      },
      'deployment-center'
    );
  };

  const getCommandBarItems = (): ICommandBarItemProps[] => {
    const commandBarItems: ICommandBarItemProps[] = [
      getSaveButton(),
      getDiscardButton(),
      getBrowseButton(),
      getManagePublishProfileButton(),
      getRefreshButton(),
    ];

    if (!siteStateContext.isContainerApp) {
      commandBarItems.push(getRedeployButton());
    }

    commandBarItems.push(getFeedbackItem());

    return commandBarItems;
  };

  const onSaveButtonClick = () => {
    portalContext.log(getTelemetryInfo(LogLevels.info, 'saveButton', 'clicked'));
    saveFunction();
  };

  const onDiscardButtonClick = () => {
    portalContext.log(getTelemetryInfo(LogLevels.info, 'discardButton', 'clicked'));
    discardFunction();
  };

  const onBrowseButtonClick = () => {
    portalContext.log(getTelemetryInfo(LogLevels.info, 'browseButton', 'clicked'));
    onBrowseClick();
  };

  const onManagePublishProfileButtonClick = () => {
    portalContext.log(getTelemetryInfo(LogLevels.info, 'managePublishProfileButton', 'clicked'));
    showPublishProfilePanel();
  };

  const onRefreshButtonClick = () => {
    portalContext.log(getTelemetryInfo(LogLevels.info, 'refreshButton', 'clicked'));
    refresh();
  };

  const onRedeployClick = () => {
    portalContext.log(getTelemetryInfo(LogLevels.info, 'redeployButton', 'clicked'));

    if (redeploy) {
      redeploy();
    } else {
      portalContext.log(getTelemetryInfo(LogLevels.error, 'redeployButton', 'undefined'));
    }
  };

  const onFeedbackButtonClick = () => {
    portalContext.log(getTelemetryInfo(LogLevels.info, 'feedbackButton', 'clicked'));
    openFeedbackBlade();
  };

  const getSaveButton = (): ICommandBarItemProps => {
    return {
      key: 'save',
      name: t('save'),
      iconProps: {
        iconName: 'Save',
      },
      ariaLabel: t('deploymentCenterSaveCommandAriaLabel'),
      disabled: isDisabledOnReload() || !isDirty,
      onClick: onSaveButtonClick,
    };
  };

  const getDiscardButton = (): ICommandBarItemProps => {
    return {
      key: 'discard',
      name: t('discard'),
      iconProps: {
        iconName: 'Cancel',
      },
      ariaLabel: t('deploymentCenterDiscardCommandAriaLabel'),
      disabled: isDisabledOnReload() || !isDirty,
      onClick: onDiscardButtonClick,
    };
  };

  const getBrowseButton = (): ICommandBarItemProps => {
    return {
      key: 'browse',
      name: t('browse'),
      iconProps: {
        iconName: 'OpenInNewTab',
      },
      ariaLabel: t('deploymentCenterBrowseCommandAriaLabel'),
      disabled: !isSiteLoaded() || !isBrowseEnabled(),
      onClick: onBrowseButtonClick,
    };
  };

  const getManagePublishProfileButton = (): ICommandBarItemProps => {
    return {
      key: 'managePublishProfile',
      name: t('managePublishProfile'),
      iconProps: {
        iconName: 'FileCode',
      },
      ariaLabel: t('deploymentCenterPublishProfileCommandAriaLabel'),
      disabled: !isSiteLoaded(),
      onClick: onManagePublishProfileButtonClick,
    };
  };

  const getRefreshButton = (): ICommandBarItemProps => {
    return {
      key: 'refresh',
      name: t('refresh'),
      iconProps: {
        iconName: 'Refresh',
      },
      ariaLabel: t('deploymentCenterRefreshCommandAriaLabel'),
      disabled: isDisabledOnReload(),
      onClick: onRefreshButtonClick,
    };
  };

  const getRedeployButton = (): ICommandBarItemProps => {
    return {
      key: 'redeploy',
      name: t('deploymentCenterRedeploy'),
      iconProps: {
        iconName: 'Redeploy',
      },
      ariaLabel: t('deploymentCenterRedeployAriaLabel'),
      disabled: isRedeployDisabled(),
      onClick: onRedeployClick,
    };
  };

  const getFeedbackItem = (): ICommandBarItemProps => {
    return {
      key: 'feedback',
      name: t('leaveFeedback'),
      iconProps: {
        iconName: 'Heart',
      },
      disabled: false,
      ariaLabel: t('leaveFeedback'),
      onClick: onFeedbackButtonClick,
    };
  };

  return (
    <CommandBar
      items={getCommandBarItems()}
      role="nav"
      styles={CommandBarStyles}
      ariaLabel={t('deploymentCenterCommandBarAriaLabel')}
      buttonAs={CustomCommandBarButton}
    />
  );
};

export default DeploymentCenterCommandBar;
