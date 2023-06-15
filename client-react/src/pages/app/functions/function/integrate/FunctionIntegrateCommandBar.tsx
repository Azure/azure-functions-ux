import { CommandBar, IButtonProps, ICommandBarItemProps } from '@fluentui/react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { CustomCommandBarButton } from '../../../../../components/CustomCommandBarButton';
import { CommandBarStyles } from '../../../../../theme/CustomOfficeFabric/AzurePortal/CommandBar.styles';

interface FunctionIntegrateCommandBarProps {
  isRefreshing: boolean;
  refreshIntegrate: () => void;
}

const FunctionIntegrateCommandBar: React.FC<FunctionIntegrateCommandBarProps> = props => {
  const { isRefreshing, refreshIntegrate } = props;
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
        disabled: isRefreshing,
        ariaLabel: t('functionIntegrateRefreshAriaLabel'),
        onClick: refreshIntegrate,
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

export default FunctionIntegrateCommandBar;
