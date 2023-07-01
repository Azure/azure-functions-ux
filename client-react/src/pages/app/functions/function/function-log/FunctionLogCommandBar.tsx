import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ActionButton, CommandBar, IButtonProps, ICommandBarItemProps, IContextualMenuItem } from '@fluentui/react';

import { CustomCommandBarButton } from '../../../../../components/CustomCommandBarButton';
import { PortalContext } from '../../../../../PortalContext';
import { ArmResourceDescriptor } from '../../../../../utils/resourceDescriptors';
import { getTelemetryInfo } from '../../common/FunctionsUtility';
import { LoggingOptions } from '../function-editor/FunctionEditor.types';

import { getCommandBarStyle, logCommandBarStyle, logFilterItemStyle } from './FunctionLog.styles';
import { LogLevel } from './FunctionLog.types';
import FunctionLogOptionsCallout from './FunctionLogOptionsCallout';

interface FunctionLogCommandBarProps {
  isPanelVisible: boolean;
  started: boolean;
  maximized: boolean;
  showMaximize: boolean;
  hideChevron: boolean;
  hideLiveMetrics: boolean;
  logLevel: LogLevel;
  setLogLevel: (level: LogLevel) => void;
  onChevronClick: () => void;
  copy: () => void;
  toggleConnection: () => void;
  clear: () => void;
  toggleMaximize: () => void;
  useNewFunctionLogsApi?: boolean;
  appInsightsResourceId?: string;
  leftAlignMainToolbarItems?: boolean;
  showLoggingOptionsDropdown?: boolean;
  selectedLoggingOption?: LoggingOptions;
  setSelectedLoggingOption?: (options: LoggingOptions) => void;
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
    logLevel,
    setLogLevel,
    leftAlignMainToolbarItems,
    showLoggingOptionsDropdown,
    selectedLoggingOption,
    useNewFunctionLogsApi,
  } = props;
  const portalContext = useContext(PortalContext);

  const { t } = useTranslation();

  const [isLoggingOptionConfirmCallOutVisible, setIsLoggingOptionConfirmCallOutVisible] = useState(false);

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
      if (showLoggingOptionsDropdown) {
        mainItems.push(getLoggingDropdown());
      }
      mainItems.push(getFilterItem(), getStartItem(), getCopyItem(), getClearItem());
      if (!hideLiveMetrics) {
        mainItems.push(getLiveMetricsItem());
      }
      if (showMaximize) {
        mainItems.push(getMaximizeItem());
      }
      if (appInsightsResourceId || showLoggingOptionsDropdown) {
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

  const setSelectedLoggingOption = () => {
    if (props.setSelectedLoggingOption) {
      if (selectedLoggingOption === LoggingOptions.appInsights) {
        setIsLoggingOptionConfirmCallOutVisible(true);
      } else {
        portalContext.log(
          getTelemetryInfo('info', 'selectedLoggingOption', 'clicked', { selectedLoggingOption: LoggingOptions.appInsights })
        );
        props.setSelectedLoggingOption(LoggingOptions.appInsights);
        portalContext.log(getTelemetryInfo('info', 'appInsightsLogging', 'selected'));
      }
    }
  };

  const getLoggingDropdown = (): ICommandBarItemProps => {
    const name =
      selectedLoggingOption === LoggingOptions.appInsights ? t('functionEditor_appInsightsLogs') : t('functionEditor_fileBasedLogs');
    return {
      key: 'loggingOptions',
      name: name,
      iconProps: {
        iconName: 'PageList',
      },
      className: 'editor-logging-dropdown', // Note (krmitta): This is required for the callout to show at the right place
      subMenuProps: {
        items: [
          {
            key: selectedLoggingOption === LoggingOptions.appInsights ? LoggingOptions.fileBased : LoggingOptions.appInsights,
            text:
              selectedLoggingOption === LoggingOptions.appInsights
                ? t('functionEditor_fileBasedLogs')
                : t('functionEditor_appInsightsLogs'),
            onClick: () => setSelectedLoggingOption(),
          },
        ],
      },
      disabled: false,
      ariaLabel: name,
    };
  };

  const onRenderFilterItem = (item: IContextualMenuItem, dismissMenu: (ev?: any, dismissAll?: boolean) => void) => {
    let iconProps = {};
    if (logLevel === item.data) {
      iconProps = {
        iconName: 'Accept',
      };
    }
    return (
      <ActionButton
        iconProps={iconProps}
        styles={logFilterItemStyle}
        onClick={ev => {
          setLogLevel(item.data);
          dismissMenu(ev, true);
        }}>
        {item.text}
      </ActionButton>
    );
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
          { key: 'verbose', text: t('verbose'), data: LogLevel.Verbose, onRender: onRenderFilterItem },
          { key: 'information', text: t('information'), data: LogLevel.Information, onRender: onRenderFilterItem },
          { key: 'warning', text: t('warning'), data: LogLevel.Warning, onRender: onRenderFilterItem },
          { key: 'error', text: t('error'), data: LogLevel.Error, onRender: onRenderFilterItem },
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
      portalContext.openBlade({
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
      });
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
    const featureName = getFeatureName();
    portalContext.openBlade({
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
    });
  };

  const getFeatureName = () => {
    if (selectedLoggingOption === LoggingOptions.fileBased) {
      return 'FunctionLogs-FileBased';
    }
    return useNewFunctionLogsApi ? 'FunctionLogs-AppInsights-V2' : 'FunctionLogs-AppInsights-V1';
  };

  const overflowButtonProps: IButtonProps = { ariaLabel: t('moreCommands') };

  return (
    <>
      <CommandBar
        items={getLeftItems()}
        farItems={getRightItems()}
        styles={styleProps => getCommandBarStyle(styleProps, leftAlignMainToolbarItems)}
        ariaLabel={t('logStreaming_logs')}
        buttonAs={CustomCommandBarButton}
        className={logCommandBarStyle}
        overflowButtonProps={overflowButtonProps}
      />
      {isLoggingOptionConfirmCallOutVisible && (
        <FunctionLogOptionsCallout
          setIsDialogVisible={setIsLoggingOptionConfirmCallOutVisible}
          setSelectedLoggingOption={props.setSelectedLoggingOption}
        />
      )}
    </>
  );
};

export default FunctionLogCommandBar;
