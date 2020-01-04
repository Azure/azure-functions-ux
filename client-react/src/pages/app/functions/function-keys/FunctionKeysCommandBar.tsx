import React from 'react';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { CommandBarStyles } from '../../../../theme/CustomOfficeFabric/AzurePortal/CommandBar.styles';
import { CustomCommandBarButton } from '../../../../components/CustomCommandBarButton';

interface FunctionKeysCommandBarProps {
  refreshFunction: () => void;
}

const FunctionKeysCommandBar: React.FC<FunctionKeysCommandBarProps> = props => {
  const { refreshFunction } = props;
  const { t } = useTranslation();

  const getItems = (): ICommandBarItemProps[] => {
    return [
      {
        key: 'refresh',
        name: t('refresh'),
        iconProps: {
          iconName: 'Refresh',
        },
        disabled: false,
        ariaLabel: t('functionKeysRefreshAriaLabel'),
        onClick: refreshFunction,
      },
    ];
  };

  return (
    <CommandBar
      items={getItems()}
      role="nav"
      styles={CommandBarStyles}
      ariaLabel={t('functionKeysCommandBarAriaLabel')}
      buttonAs={CustomCommandBarButton}
    />
  );
};

export default FunctionKeysCommandBar;
