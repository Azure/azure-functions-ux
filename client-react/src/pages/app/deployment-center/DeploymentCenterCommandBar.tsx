import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ICommandBarItemProps, CommandBar } from 'office-ui-fabric-react';
import { CommandBarStyles } from '../../../theme/CustomOfficeFabric/AzurePortal/CommandBar.styles';
import { CustomCommandBarButton } from '../../../components/CustomCommandBarButton';
import { SiteStateContext } from '../../../SiteState';

interface DeploymentCenterCommandBarProps {
  saveFunction: () => void;
  discardFunction: () => void;
  managePublishProfileFunction: () => void;
  refreshFunction: () => void;
}

const DeploymentCenterCommandBar: React.FC<DeploymentCenterCommandBarProps> = props => {
  const { saveFunction, discardFunction, managePublishProfileFunction, refreshFunction } = props;
  const { t } = useTranslation();
  const siteStateContext = useContext(SiteStateContext);

  const siteLoaded = () => {
    return siteStateContext.site && siteStateContext.site.properties;
  };

  const browseEnabled = () => {
    return siteStateContext.site && siteStateContext.site.properties.hostNames.length > 0 && !siteStateContext.stopped;
  };

  const browseOnClick = () => {
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
      disabled: !siteLoaded(),
      onClick: saveFunction,
    },
    {
      key: 'discard',
      name: t('discard'),
      iconProps: {
        iconName: 'Cancel',
      },
      ariaLabel: t('deploymentCenterDiscardCommandAriaLabel'),
      disabled: !siteLoaded(),
      onClick: discardFunction,
    },
    {
      key: 'browse',
      name: t('browse'),
      iconProps: {
        iconName: 'OpenInNewTab',
      },
      ariaLabel: t('deploymentCenterBrowseCommandAriaLabel'),
      disabled: !siteLoaded() || !browseEnabled(),
      onClick: browseOnClick,
    },
    {
      key: 'managePublishProfile',
      name: t('managePublishProfile'),
      iconProps: {
        iconName: 'FileCode',
      },
      ariaLabel: t('deploymentCenterPublishProfileCommandAriaLabel'),
      disabled: !siteLoaded(),
      onClick: managePublishProfileFunction,
    },
    {
      key: 'refresh',
      name: t('refresh'),
      iconProps: {
        iconName: 'Refresh',
      },
      ariaLabel: t('deploymentCenterRefreshCommandAriaLabel'),
      disabled: !siteLoaded(),
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
