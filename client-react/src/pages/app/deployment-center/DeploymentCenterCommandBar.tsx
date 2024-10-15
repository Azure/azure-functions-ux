import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ICommandBarItemProps, CommandBar, IButtonProps } from '@fluentui/react';
import { CommandBarStyles } from '../../../theme/CustomOfficeFabric/AzurePortal/CommandBar.styles';
import { CustomCommandBarButton } from '../../../components/CustomCommandBarButton';
import { SiteStateContext } from '../../../SiteState';
import { DeploymentCenterCommandBarProps } from './DeploymentCenter.types';
import { DeploymentCenterContext } from './DeploymentCenterContext';
import { ScmType } from '../../../models/site/config';
import { PortalContext } from '../../../PortalContext';
import { getTelemetryInfo } from './utility/DeploymentCenterUtility';
import { CommonConstants } from '../../../utils/CommonConstants';

const DeploymentCenterCommandBar: React.FC<DeploymentCenterCommandBarProps> = props => {
  const {
    saveFunction,
    discardFunction,
    showPublishProfilePanel,
    redeploy,
    isDataRefreshing,
    isDirty,
    isValid,
    isVstsBuildProvider,
  } = props;
  const { t } = useTranslation();

  const portalContext = useContext(PortalContext);
  const siteStateContext = useContext(SiteStateContext);
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const overflowButtonProps: IButtonProps = { ariaLabel: t('moreCommands') };
  const hasNoWritePermission = deploymentCenterContext && !deploymentCenterContext.hasWritePermission;

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
    return !isSiteLoaded() || isDataRefreshing;
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

  const isSaveDisabled = () => {
    return isDisabledOnReload() || !(isDirty && isValid) || isVstsBuildProvider || hasNoWritePermission;
  };

  const isDiscardDisabled = () => {
    return isDisabledOnReload() || !isDirty || hasNoWritePermission;
  };

  const openFeedbackBlade = () => {
    const featureName = siteStateContext?.isFunctionApp ? 'FunctionAppDeploymentCenter' : 'AppServiceDeploymentCenter';
    portalContext.openBlade({
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
    });
  };

  const openSCIFrameBlade = () => {
    const functionAppParameters = {
      key: 'Referrer',
      value: {
        ExtensionName: CommonConstants.Extensions.WebsitesExtension,
        BladeName: 'DeploymentCenter',
        TabName: '',
        DetectorId: 'FunctionsDeploymentExternal',
        DetectorType: 'Detector',
        CategoryId: 'Configuration And Management',
      },
    };

    const optionalParameters = [functionAppParameters];

    portalContext.openBlade({
      detailBlade: 'SCIFrameBlade',
      detailBladeInputs: {
        id: deploymentCenterContext.resourceId,
        optionalParameters: optionalParameters,
      },
      extension: CommonConstants.Extensions.WebsitesExtension,
      openAsContextBlade: true,
    });
  };

  const getCommandBarItems = (): ICommandBarItemProps[] => {
    const commandBarItems: ICommandBarItemProps[] = [
      getSaveButton(),
      getDiscardButton(),
      getBrowseButton(),
      getManagePublishProfileButton(),
    ];

    if (!siteStateContext.isContainerApp) {
      commandBarItems.push(getRedeployButton());
    }

    commandBarItems.push(getFeedbackItem());
    if (siteStateContext.isFunctionApp) {
      commandBarItems.push(getTroubleShootItem());
    }

    return commandBarItems;
  };

  const onSaveButtonClick = () => {
    portalContext.log(getTelemetryInfo('info', 'saveButton', 'clicked'));
    saveFunction();
  };

  const onDiscardButtonClick = () => {
    portalContext.log(getTelemetryInfo('info', 'discardButton', 'clicked'));
    discardFunction();
  };

  const onBrowseButtonClick = () => {
    portalContext.log(getTelemetryInfo('info', 'browseButton', 'clicked'));
    onBrowseClick();
  };

  const onManagePublishProfileButtonClick = () => {
    portalContext.log(getTelemetryInfo('info', 'managePublishProfileButton', 'clicked'));
    showPublishProfilePanel();
  };

  const onTroubleShootButtonClick = () => {
    portalContext.log(getTelemetryInfo('info', 'troubleshootButton', 'clicked'));
    openSCIFrameBlade();
  };

  const onRedeployClick = () => {
    portalContext.log(getTelemetryInfo('info', 'redeployButton', 'clicked'));

    if (redeploy) {
      redeploy();
    } else {
      portalContext.log(getTelemetryInfo('error', 'redeployButton', 'undefined'));
    }
  };

  const onFeedbackButtonClick = () => {
    portalContext.log(getTelemetryInfo('info', 'feedbackButton', 'clicked'));
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
      disabled: isSaveDisabled(),
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
      disabled: isDiscardDisabled(),
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

  const getRedeployButton = (): ICommandBarItemProps => {
    return {
      key: 'redeploy',
      name: t('deploymentCenterSync'),
      iconProps: {
        iconName: 'Redeploy',
      },
      ariaLabel: t('deploymentCenterSyncCommandAriaLabel'),
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

  const getTroubleShootItem = (): ICommandBarItemProps => {
    return {
      key: 'troubleshoot',
      name: t('troubleshoot'),
      iconProps: {
        iconName: 'DeveloperTools',
      },
      disabled: false,
      ariaLabel: t('troubleshoot'),
      onClick: onTroubleShootButtonClick,
    };
  };

  return (
    <CommandBar
      items={getCommandBarItems()}
      styles={CommandBarStyles}
      ariaLabel={t('deploymentCenterCommandBarAriaLabel')}
      buttonAs={CustomCommandBarButton}
      overflowButtonProps={overflowButtonProps}
    />
  );
};

export default DeploymentCenterCommandBar;
