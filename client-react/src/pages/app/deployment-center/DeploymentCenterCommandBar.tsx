import React from 'react';
import { useTranslation } from 'react-i18next';
import { ICommandBarItemProps, CommandBar } from 'office-ui-fabric-react';
import { CommandBarStyles } from '../../../theme/CustomOfficeFabric/AzurePortal/CommandBar.styles';
import { CustomCommandBarButton } from '../../../components/CustomCommandBarButton';

interface DeploymentCenterCommandBarProps {
  saveFunction: () => void;
  discardFunction: () => void;
  browseFunction: () => void;
  managePublishProfileFunction: () => void;
  refreshFunction: () => void;
  loading: boolean;
  hasPermission: boolean;
}

const DeploymentCenterCommandBar: React.FC<DeploymentCenterCommandBarProps> = props => {
  const { saveFunction, discardFunction, browseFunction, managePublishProfileFunction, refreshFunction, loading, hasPermission } = props;
  const { t } = useTranslation();

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'save',
      name: t('save'),
      iconProps: {
        iconName: 'Save',
      },
      disabled: loading || !hasPermission,
      ariaLabel: t('deploymentCenterSaveCommandAriaLabel'),
      onClick: saveFunction,
    },
    {
      key: 'discard',
      name: t('discard'),
      iconProps: {
        iconName: 'Cancel',
      },
      disabled: loading || !hasPermission,
      ariaLabel: t('deploymentCenterDiscardCommandAriaLabel'),
      onClick: discardFunction,
    },
    {
      key: 'browseFunction',
      name: t('browse'),
      iconProps: {
        iconName: 'OpenInNewTab',
      },
      disabled: loading || !hasPermission,
      ariaLabel: t('deploymentCenterBrowseCommandAriaLabel'),
      onClick: browseFunction,
    },
    {
      key: 'managePublishProfile',
      name: t('managePublishProfile'),
      iconProps: {
        iconName: 'FileCode',
      },
      disabled: loading || !hasPermission,
      ariaLabel: t('deploymentCenterPublishProfileCommandAriaLabel'),
      onClick: managePublishProfileFunction,
    },
    {
      key: 'refresh',
      name: t('refresh'),
      iconProps: {
        iconName: 'Refresh',
      },
      disabled: loading || !hasPermission,
      ariaLabel: t('deploymentCenterRefreshCommandAriaLabel'),
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
