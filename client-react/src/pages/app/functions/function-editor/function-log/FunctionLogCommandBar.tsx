import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CommandBarStyles } from '../../../../../theme/CustomOfficeFabric/AzurePortal/CommandBar.styles';
import { CustomCommandBarButton } from '../../../../../components/CustomCommandBarButton';
import { logCommandBarStyle } from './FunctionLog.styles';

interface FunctionLogCommandBarProps {
  onChevronClick: () => void;
  copy: () => void;
  toggleConnection: () => void;
  clear: () => void;
  toggleMaximize: () => void;
  isPanelVisible: boolean;
  started: boolean;
  maximized: boolean;
}

const FunctionLogCommandBar: React.FC<FunctionLogCommandBarProps> = props => {
  const { onChevronClick, isPanelVisible, copy, started, toggleConnection, clear, toggleMaximize, maximized } = props;
  const { t } = useTranslation();

  const getItems = (): ICommandBarItemProps[] => {
    return [
      {
        key: 'logs',
        name: t('logStreaming_logs'),
        iconProps: {
          iconName: isPanelVisible ? 'ChevronDown' : 'ChevronUp',
        },
        disabled: false,
        ariaLabel: t('logStreaming_logs'),
        onClick: onChevronClick,
      },
    ];
  };

  const getFarItems = (): ICommandBarItemProps[] => {
    return isPanelVisible
      ? [
          {
            key: 'start',
            name: started ? t('stop') : t('start'),
            iconProps: {
              iconName: started ? 'Stop' : 'TriangleRight12',
            },
            disabled: false,
            ariaLabel: started ? t('stop') : t('start'),
            onClick: toggleConnection,
          },
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
          {
            key: 'clear',
            name: t('logStreaming_clear'),
            iconProps: {
              iconName: 'CalculatorMultiply',
            },
            disabled: false,
            ariaLabel: t('logStreaming_clear'),
            onClick: clear,
          },
          {
            key: 'expand',
            name: maximized ? t('minimize') : t('maximize'),
            iconProps: {
              iconName: maximized ? 'BackToWindow' : 'FullScreen',
            },
            disabled: false,
            ariaLabel: maximized ? t('minimize') : t('maximize'),
            onClick: toggleMaximize,
          },
        ]
      : [];
  };

  return (
    <>
      <CommandBar
        items={getItems()}
        farItems={getFarItems()}
        styles={CommandBarStyles}
        ariaLabel={t('logStreaming_logs')}
        buttonAs={CustomCommandBarButton}
        className={logCommandBarStyle}
      />
    </>
  );
};

export default FunctionLogCommandBar;
