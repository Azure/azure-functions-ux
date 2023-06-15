import { CommandBar, IButtonProps, ICommandBarItemProps } from '@fluentui/react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { CustomCommandBarButton } from '../../../../../components/CustomCommandBarButton';
import { CommandBarStyles } from '../../../../../theme/CustomOfficeFabric/AzurePortal/CommandBar.styles';

interface FunctionKeysCommandBarProps {
  refreshFunction: () => void;
  appPermission: boolean;
  loading: boolean;
}

const FunctionKeysCommandBar: React.FC<FunctionKeysCommandBarProps> = props => {
  const { refreshFunction, appPermission, loading } = props;
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
        disabled: !appPermission || loading,
        ariaLabel: t('functionKeysRefreshAriaLabel'),
        onClick: refreshFunction,
      },
    ];
  };

  return (
    <CommandBar
      items={getItems()}
      styles={CommandBarStyles}
      ariaLabel={t('functionKeysCommandBarAriaLabel')}
      buttonAs={CustomCommandBarButton}
      overflowButtonProps={overflowButtonProps}
    />
  );
};

export default FunctionKeysCommandBar;
