import React, { useState } from 'react';
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
interface FunctionLogProps {
  toggleExpand: () => void;
  isExpanded: boolean;
}

const FunctionLog: React.FC<FunctionLogProps> = props => {
  const { t } = useTranslation();
  const { toggleExpand, isExpanded } = props;
  const [connected, setConnected] = useState(true);
  const [maximized, setMaximized] = useState(false);
  const [started, setStarted] = useState(false);

  const onExpandClick = () => {
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
                  <Icon iconName="PlugDisconnected" className={logCommandBarButtonStyle} />
                  {t('disconnect')}
                </>
              ) : (
                <>
                  <Icon iconName="PlugConnected" className={logCommandBarButtonStyle} />
                  {t('connect')}
                </>
              )}
            </span>
            <span onClick={toggleStart} className={logCommandBarButtonLabelStyle}>
              {started ? (
                <>
                  <Icon iconName="Stop" className={logCommandBarButtonStyle} />
                  {t('stop')}
                </>
              ) : (
                <>
                  <Icon iconName="TriangleRight12" className={logCommandBarButtonStyle} />
                  {t('start')}
                </>
              )}
            </span>
            <span className={logCommandBarSeparatorStyle} />
            <span className={logCommandBarButtonLabelStyle}>
              <Icon iconName="Copy" className={logCommandBarButtonStyle} />
              {t('functionKeys_copy')}
            </span>
            <span className={logCommandBarButtonLabelStyle}>
              <Icon iconName="CalculatorMultiply" className={logCommandBarButtonStyle} />
              {t('logStreaming_clear')}
            </span>
            <span onClick={toggleMaximize} className={logCommandBarButtonLabelStyle}>
              {maximized ? (
                <>
                  <Icon iconName="BackToWindow" className={logCommandBarButtonStyle} />
                  {t('minimize')}
                </>
              ) : (
                <>
                  <Icon iconName="FullScreen" className={logCommandBarButtonStyle} />
                  {t('maximize')}
                </>
              )}
            </span>
          </span>
        )}
      </div>
      {isExpanded && <div className={logStreamStyle} />}
    </div>
  );
};

export default FunctionLog;
