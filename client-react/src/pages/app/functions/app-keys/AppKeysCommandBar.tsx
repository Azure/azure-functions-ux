import React from 'react';
import { CommandBar, IButtonProps, ICommandBarItemProps } from '@fluentui/react';
import { useTranslation } from 'react-i18next';
import { CommandBarStyles } from '../../../../theme/CustomOfficeFabric/AzurePortal/CommandBar.styles';
import { CustomCommandBarButton } from '../../../../components/CustomCommandBarButton';

interface AppKeysCommandBarProps {
  refreshFunction: () => void;
  loading: boolean;
  appPermission: boolean;
}

const AppKeysCommandBar: React.FC<AppKeysCommandBarProps> = props => {
  const { refreshFunction, loading, appPermission } = props;
  const { t } = useTranslation();
  const overflowButtonProps: IButtonProps = { ariaLabel: t('moreCommands') };

  const getItems = (): ICommandBarItemProps[] => {
    return [
      {
        key: 'refresh',
        name: t('refresh'),
        iconProps: {
          iconName: 'Refresh',
        },
        disabled: loading || !appPermission,
        ariaLabel: t('appSettingsRefreshAriaLabel'),
        onClick: refreshFunction,
      },
    ];
  };

  return (
    <CommandBar
      items={getItems()}
      styles={CommandBarStyles}
      ariaLabel={t('appSettingsCommandBarAriaLabel')}
      buttonAs={CustomCommandBarButton}
      overflowButtonProps={overflowButtonProps}
    />
  );
};

export default AppKeysCommandBar;
