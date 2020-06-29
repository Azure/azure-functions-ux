import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomCommandBarButton } from '../../../../../components/CustomCommandBarButton';
import { logCommandBarStyle, getCommandBarStyle } from './FunctionLog.styles';
import { PortalContext } from '../../../../../PortalContext';
import { ArmResourceDescriptor } from '../../../../../utils/resourceDescriptors';
import { LogLevel } from './FunctionLog.types';

interface FunctionLogCommandBarProps {
  onChevronClick: () => void;
  copy: () => void;
  toggleConnection: () => void;
  clear: () => void;
  toggleMaximize: () => void;
  isPanelVisible: boolean;
  started: boolean;
  maximized: boolean;
  showMaximize: boolean;
  hideChevron: boolean;
  hideLiveMetrics: boolean;
  setLogLevel: (level: LogLevel) => void;
  appInsightsResourceId?: string;
  leftAlignMainToolbarItems?: boolean;
}

const FunctionLogCommandBar: React.FC<FunctionLogCommandBarProps> = props => {
  const {
    onChevronClick,
    isPanelVisible,
    copy,
    started,
    toggleConnection,
    clear,
    toggleMaximize,
    maximized,
    showMaximize,
    hideChevron,
    hideLiveMetrics,
    appInsightsResourceId,
    setLogLevel,
    leftAlignMainToolbarItems,
  } = props;
  const portalContext = useContext(PortalContext);
  const { t } = useTranslation();

  const getLeftItems = (): ICommandBarItemProps[] => {
    let items: ICommandBarItemProps[] = [];
    if (!hideChevron) {
      items.push(getChevronItem());
    }
    if (leftAlignMainToolbarItems) {
      items = items.concat(getMainItems());
    }
    return items;
  };

  const getRightItems = (): ICommandBarItemProps[] => {
    let farItems: ICommandBarItemProps[] = [];
    if (!leftAlignMainToolbarItems) {
      farItems = farItems.concat(getMainItems());
    }
    return farItems;
  };

  const getMainItems = (): ICommandBarItemProps[] => {
    const mainItems: ICommandBarItemProps[] = [];
    if (isPanelVisible) {
      mainItems.push(getFilterItem(), getStartItem(), getCopyItem(), getClearItem());
      if (!hideLiveMetrics) {
        mainItems.push(getLiveMetricsItem());
      }
      if (showMaximize) {
        mainItems.push(getMaximizeItem());
      }
      if (appInsightsResourceId) {
        mainItems.push(getFeedbackItem());
      }
    }
    return mainItems;
  };

  const getChevronItem = (): ICommandBarItemProps => {
    return {
      key: 'logs',
      name: t('logStreaming_logs'),
      iconProps: {
        iconName: isPanelVisible ? 'ChevronDown' : 'ChevronUp',
      },
      disabled: false,
      ariaLabel: t('logStreaming_logs'),
      onClick: onChevronClick,
    };
  };

  const getFilterItem = (): ICommandBarItemProps => {
    return {
      key: 'filter',
      name: t('functionMonitor_logLevel'),
      iconProps: {
        iconName: 'Filter',
      },
      subMenuProps: {
        items: [
          { key: 'verbose', text: t('verbose'), onClick: () => setLogLevel(LogLevel.Verbose) },
          { key: 'information', text: t('information'), onClick: () => setLogLevel(LogLevel.Information) },
          { key: 'warning', text: t('warning'), onClick: () => setLogLevel(LogLevel.Warning) },
          { key: 'error', text: t('error'), onClick: () => setLogLevel(LogLevel.Error) },
        ],
      },
      disabled: false,
      ariaLabel: t('functionMonitor_logLevel'),
    };
  };

  const getStartItem = (): ICommandBarItemProps => {
    return {
      key: 'start',
      name: started ? t('stop') : t('start'),
      iconProps: {
        iconName: started ? 'Stop' : 'TriangleRight12',
      },
      disabled: false,
      ariaLabel: started ? t('stop') : t('start'),
      onClick: toggleConnection,
    };
  };

  const getCopyItem = (): ICommandBarItemProps => {
    return {
      key: 'copy',
      name: t('functionKeys_copy'),
      iconProps: {
        iconName: 'Copy',
      },
      disabled: false,
      ariaLabel: t('functionKeys_copy'),
      onClick: copy,
    };
  };

  const getClearItem = (): ICommandBarItemProps => {
    return {
      key: 'clear',
      name: t('logStreaming_clear'),
      iconProps: {
        iconName: 'CalculatorMultiply',
      },
      disabled: false,
      ariaLabel: t('logStreaming_clear'),
      onClick: clear,
    };
  };

  const getLiveMetricsItem = (): ICommandBarItemProps => {
    return {
      key: 'liveMetrics',
      name: t('logStreaming_openInLiveMetrics'),
      iconProps: {
        iconName: 'LineChart',
      },
      disabled: false,
      ariaLabel: t('logStreaming_openInLiveMetrics'),
      onClick: openLiveMetrics,
    };
  };

  const openLiveMetrics = () => {
    if (appInsightsResourceId) {
      const descriptor = new ArmResourceDescriptor(appInsightsResourceId);
      portalContext.openBlade(
        {
          detailBlade: 'QuickPulseBladeV2',
          detailBladeInputs: {
            ComponentId: {
              Name: descriptor.resourceName,
              SubscriptionId: descriptor.subscription,
              ResourceGroup: descriptor.resourceGroup,
            },
            ResourceId: descriptor.resourceId,
          },
          extension: 'AppInsightsExtension',
        },
        'function-logs'
      );
    }
  };

  const getMaximizeItem = (): ICommandBarItemProps => {
    return {
      key: 'expand',
      name: maximized ? t('minimize') : t('maximize'),
      iconProps: {
        iconName: maximized ? 'BackToWindow' : 'FullScreen',
      },
      disabled: false,
      ariaLabel: maximized ? t('minimize') : t('maximize'),
      onClick: toggleMaximize,
    };
  };

  const getFeedbackItem = (): ICommandBarItemProps => {
    return {
      key: 'feedback',
      name: t('leaveFeedback'),
      iconProps: {
        iconName: 'Heart',
      },
      disabled: false,
      ariaLabel: t('leaveFeedback'),
      onClick: openFeedbackBlade,
    };
  };

  const openFeedbackBlade = () => {
    const featureName = 'FunctionLogs';
    portalContext.openBlade(
      {
        detailBlade: 'InProductFeedbackBlade',
        extension: 'HubsExtension',
        openAsContextBlade: true,
        detailBladeInputs: {
          bladeName: `${featureName}`,
          cesQuestion: t('functionLogsFeedbackCESQuestion'),
          cvaQuestion: t('functionLogsFeedbackCVAQuestion'),
          extensionName: 'WebsitesExtension',
          featureName: `${featureName}`,
          surveyId: `${featureName}-0420`,
        },
      },
      'function-logs'
    );
  };

  return (
    <CommandBar
      items={getLeftItems()}
      farItems={getRightItems()}
      styles={styleProps => getCommandBarStyle(styleProps, leftAlignMainToolbarItems)}
      ariaLabel={t('logStreaming_logs')}
      buttonAs={CustomCommandBarButton}
      className={logCommandBarStyle}
    />
  );
};

export default FunctionLogCommandBar;
