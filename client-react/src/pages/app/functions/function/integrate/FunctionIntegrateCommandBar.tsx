import React from 'react';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { CommandBarStyles } from '../../../../../theme/CustomOfficeFabric/AzurePortal/CommandBar.styles';
import { CustomCommandBarButton } from '../../../../../components/CustomCommandBarButton';

interface FunctionIntegrateCommandBarProps {
  isRefreshing: boolean;
  refreshIntegrate: () => void;
}

const FunctionIntegrateCommandBar: React.FC<FunctionIntegrateCommandBarProps> = props => {
  const { isRefreshing, refreshIntegrate } = props;
  const { t } = useTranslation();

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
      role="nav"
      styles={CommandBarStyles}
      ariaLabel={t('appSettingsCommandBarAriaLabel')}
      buttonAs={CustomCommandBarButton}
    />
  );
};

export default FunctionIntegrateCommandBar;
