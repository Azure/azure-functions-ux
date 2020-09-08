import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ICommandBarItemProps, CommandBar } from 'office-ui-fabric-react';
import { CommandBarStyles } from '../../../theme/CustomOfficeFabric/AzurePortal/CommandBar.styles';
import { CustomCommandBarButton } from '../../../components/CustomCommandBarButton';
import { SiteStateContext } from '../../../SiteState';
import { DeploymentCenterCommandBarProps } from './DeploymentCenter.types';
import { DeploymentCenterContext } from './DeploymentCenterContext';
import { ScmType } from '../../../models/site/config';

const DeploymentCenterCommandBar: React.FC<DeploymentCenterCommandBarProps> = props => {
  const { saveFunction, discardFunction, showPublishProfilePanel, refresh, sync, isLoading } = props;
  const { t } = useTranslation();
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

  const isSyncDisabled = () => {
    return (
      (deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType === ScmType.GitHubAction) ||
      (deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType === ScmType.None)
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
      commandBarItems.push(getSyncButton());
    }

    return commandBarItems;
  };

  const getSaveButton = (): ICommandBarItemProps => {
    return {
      key: 'save',
      name: t('save'),
      iconProps: {
        iconName: 'Save',
      },
      ariaLabel: t('deploymentCenterSaveCommandAriaLabel'),
      disabled: isDisabledOnReload(),
      onClick: saveFunction,
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
      disabled: isDisabledOnReload(),
      onClick: discardFunction,
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
      onClick: onBrowseClick,
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
      onClick: showPublishProfilePanel,
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
      onClick: refresh,
    };
  };

  const getSyncButton = (): ICommandBarItemProps => {
    return {
      key: 'sync',
      name: t('sync'),
      iconProps: {
        iconName: 'Sync',
      },
      ariaLabel: t('deploymentCenterSyncCommandAriaLabel'),
      disabled: isDisabledOnReload() || isSyncDisabled(),
      onClick: sync,
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
