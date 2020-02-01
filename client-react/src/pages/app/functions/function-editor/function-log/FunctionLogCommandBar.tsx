import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CommandBarStyles } from '../../../../../theme/CustomOfficeFabric/AzurePortal/CommandBar.styles';
import { CustomCommandBarButton } from '../../../../../components/CustomCommandBarButton';
import { ReactComponent as DownChevron } from './../../../../../images/Common/down-chevron.svg';
import { registerIcons } from '@uifabric/styling';
import { chevronIconStyle } from './FunctionLog.styles';
registerIcons({
  icons: {
    'down-chevron': <DownChevron />,
  },
});

// Data for CommandBar
interface FunctionLogCommandBarProps {
  onChevronClick: () => void;
  copy: () => void;
  isPanelVisible: boolean;
}

const FunctionLogCommandBar: React.FC<FunctionLogCommandBarProps> = props => {
  const { onChevronClick, isPanelVisible, copy } = props;
  const { t } = useTranslation();

  const getItems = (): ICommandBarItemProps[] => {
    return [
      {
        key: 'logs',
        name: t('logStreaming_logs'),
        iconProps: {
          iconName: 'down-chevron',
          className: chevronIconStyle(!isPanelVisible),
        },
        disabled: false,
        ariaLabel: t('logStreaming_logs'),
        onClick: onChevronClick,
      },
    ];
  };

  const getFarItems = (): ICommandBarItemProps[] => {
    return [
      {
        key: 'copy',
        name: t('functionKeys_copy'),
        iconProps: {
          iconName: 'Copy',
        },
        disabled: false,
        ariaLabel: t('functionKeys_copy'),
        onClick: copy,
      },
    ];
  };

  return (
    <>
      <CommandBar
        items={getItems()}
        farItems={getFarItems()}
        styles={CommandBarStyles}
        ariaLabel={t('logStreaming_logs')}
        buttonAs={CustomCommandBarButton}
      />
    </>
  );
};

export default FunctionLogCommandBar;
