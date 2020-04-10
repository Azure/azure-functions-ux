import React from 'react';
import { ICommandBarItemProps, CommandBar } from 'office-ui-fabric-react';
import { CommandBarStyles } from '../../../theme/CustomOfficeFabric/AzurePortal/CommandBar.styles';
import { CustomCommandBarButton } from '../../../components/CustomCommandBarButton';
import { useTranslation } from 'react-i18next';

interface ConfigurationCommandBarProps {}

const ConfigurationCommandBar: React.FC<ConfigurationCommandBarProps> = props => {
  const { t } = useTranslation();

  const getItems = (): ICommandBarItemProps[] => {
    return [
      {
        key: 'save',
        text: t('save'),
        iconProps: {
          iconName: 'Save',
        },
        disabled: false,
        onClick: () => {},
      },
      {
        key: 'discard',
        text: t('discard'),
        iconProps: {
          iconName: 'ChromeClose',
        },
        disabled: false,
        onClick: () => {},
      },
      {
        key: 'refresh',
        text: t('refresh'),
        iconProps: {
          iconName: 'Refresh',
        },
        disabled: false,
        onClick: () => {},
      },
    ];
  };
  return <CommandBar items={getItems()} role="nav" styles={CommandBarStyles} buttonAs={CustomCommandBarButton} />;
};

export default ConfigurationCommandBar;
