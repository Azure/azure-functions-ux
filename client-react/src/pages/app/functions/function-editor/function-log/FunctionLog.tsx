import React, { useState, useContext, useEffect } from 'react';
import { ReactComponent as DownChevron } from './../../../../../images/Common/down-chevron.svg';
import {
  chevronIconStyle,
  logCommandBarStyle,
  logExpandButtonStyle,
  logStreamStyle,
  logCommandBarButtonListStyle,
  logCommandBarButtonLabelStyle,
  logCommandBarButtonStyle,
  logCommandBarSeparatorStyle,
} from './FunctionLog.styles';
import { useTranslation } from 'react-i18next';
import { Icon } from 'office-ui-fabric-react';
import { ThemeContext } from '../../../../../ThemeContext';
import { QuickPulseQueryLayer } from '../../../../../QuickPulseQuery';
import { CommonConstants } from '../../../../../utils/CommonConstants';
import { defaultDocumentStreams } from './FunctionLog.constants';
interface FunctionLogProps {
  toggleExpand: () => void;
  toggleFullscreen: (fullscreen: boolean) => void;
  isExpanded: boolean;
  appInsightsToken?: string;
}

const FunctionLog: React.FC<FunctionLogProps> = props => {
  const { t } = useTranslation();
  const { toggleExpand, isExpanded, toggleFullscreen, appInsightsToken } = props;
  const [connected, setConnected] = useState(true);
  const [maximized, setMaximized] = useState(false);
  const [started, setStarted] = useState(false);
  const [queryLayer, setQueryLayer] = useState<QuickPulseQueryLayer | undefined>(undefined);

  const theme = useContext(ThemeContext);

  // TODO: allisonm Move logic to log in console
  // WI 5906972
  if (appInsightsToken) {
    if (!queryLayer) {
      const ql = new QuickPulseQueryLayer(CommonConstants.QuickPulseEndpoints.public, 'functions');
      ql.setConfiguration([], defaultDocumentStreams, []);
      setQueryLayer(ql);
    } else if (queryLayer) {
      queryLayer.queryDetails(appInsightsToken, false, '').then(dataV2 => {
        if (dataV2) {
          console.log(dataV2);
        }
      });
    }
  }

  const onExpandClick = () => {
    if (isExpanded && maximized) {
      toggleMaximize();
    }
    toggleExpand();
  };

  const toggleConnection = () => {
    setConnected(!connected);
  };

  const toggleStart = () => {
    setStarted(!started);
  };

  const toggleMaximize = () => {
    setMaximized(!maximized);
  };

  useEffect(() => {
    toggleFullscreen(maximized);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maximized]);
  return (
    <div>
      <div className={logCommandBarStyle}>
        <span className={logExpandButtonStyle} onClick={onExpandClick}>
          <DownChevron className={chevronIconStyle(isExpanded)} />
          {t('logStreaming_logs')}
        </span>
        {isExpanded && (
          <span className={logCommandBarButtonListStyle}>
            <span onClick={toggleConnection} className={logCommandBarButtonLabelStyle}>
              {connected ? (
                <>
                  <Icon iconName="PlugDisconnected" className={logCommandBarButtonStyle(theme)} />
                  {t('disconnect')}
                </>
              ) : (
                <>
                  <Icon iconName="PlugConnected" className={logCommandBarButtonStyle(theme)} />
                  {t('connect')}
                </>
              )}
            </span>
            <span onClick={toggleStart} className={logCommandBarButtonLabelStyle}>
              {started ? (
                <>
                  <Icon iconName="Stop" className={logCommandBarButtonStyle(theme)} />
                  {t('stop')}
                </>
              ) : (
                <>
                  <Icon iconName="TriangleRight12" className={logCommandBarButtonStyle(theme)} />
                  {t('start')}
                </>
              )}
            </span>
            <span className={logCommandBarSeparatorStyle} />
            <span className={logCommandBarButtonLabelStyle}>
              <Icon iconName="Copy" className={logCommandBarButtonStyle(theme)} />
              {t('functionKeys_copy')}
            </span>
            <span className={logCommandBarButtonLabelStyle}>
              <Icon iconName="CalculatorMultiply" className={logCommandBarButtonStyle(theme)} />
              {t('logStreaming_clear')}
            </span>
            <span onClick={toggleMaximize} className={logCommandBarButtonLabelStyle}>
              {maximized ? (
                <>
                  <Icon iconName="BackToWindow" className={logCommandBarButtonStyle(theme)} />
                  {t('minimize')}
                </>
              ) : (
                <>
                  <Icon iconName="FullScreen" className={logCommandBarButtonStyle(theme)} />
                  {t('maximize')}
                </>
              )}
            </span>
          </span>
        )}
      </div>
      {isExpanded && <div className={logStreamStyle(maximized)} />}
    </div>
  );
};

export default FunctionLog;
