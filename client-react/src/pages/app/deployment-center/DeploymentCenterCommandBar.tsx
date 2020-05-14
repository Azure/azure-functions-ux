import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ICommandBarItemProps, CommandBar } from 'office-ui-fabric-react';
import { CommandBarStyles } from '../../../theme/CustomOfficeFabric/AzurePortal/CommandBar.styles';
import { CustomCommandBarButton } from '../../../components/CustomCommandBarButton';
import { SiteStateContext } from '../../../SiteState';
import { DeploymentCenterCommandBarProps } from './DeploymentCenter.types';

const DeploymentCenterCommandBar: React.FC<DeploymentCenterCommandBarProps> = props => {
  const { saveFunction, discardFunction, showPublishProfilePanel, refreshFunction } = props;
  const { t } = useTranslation();
  const siteStateContext = useContext(SiteStateContext);

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

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'save',
      name: t('save'),
      iconProps: {
        iconName: 'Save',
      },
      ariaLabel: t('deploymentCenterSaveCommandAriaLabel'),
      disabled: !isSiteLoaded(),
      onClick: saveFunction,
    },
    {
      key: 'discard',
      name: t('discard'),
      iconProps: {
        iconName: 'Cancel',
      },
      ariaLabel: t('deploymentCenterDiscardCommandAriaLabel'),
      disabled: !isSiteLoaded(),
      onClick: discardFunction,
    },
    {
      key: 'browse',
      name: t('browse'),
      iconProps: {
        iconName: 'OpenInNewTab',
      },
      ariaLabel: t('deploymentCenterBrowseCommandAriaLabel'),
      disabled: !isSiteLoaded() || !isBrowseEnabled(),
      onClick: onBrowseClick,
    },
    {
      key: 'managePublishProfile',
      name: t('managePublishProfile'),
      iconProps: {
        iconName: 'FileCode',
      },
      ariaLabel: t('deploymentCenterPublishProfileCommandAriaLabel'),
      disabled: !isSiteLoaded(),
      onClick: showPublishProfilePanel,
    },
    {
      key: 'refresh',
      name: t('refresh'),
      iconProps: {
        iconName: 'Refresh',
      },
      ariaLabel: t('deploymentCenterRefreshCommandAriaLabel'),
      disabled: !isSiteLoaded(),
      onClick: refreshFunction,
    },
  ];

  return (
    <CommandBar
      items={commandBarItems}
      role="nav"
      styles={CommandBarStyles}
      ariaLabel={t('deploymentCenterCommandBarAriaLabel')}
      buttonAs={CustomCommandBarButton}
    />
  );
};

export default DeploymentCenterCommandBar;
