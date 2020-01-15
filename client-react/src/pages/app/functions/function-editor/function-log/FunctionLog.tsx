import React from 'react';
import { ReactComponent as DownChevron } from './../../../../../images/Common/down-chevron.svg';
import { chevronIconStyle, logCommandBarStyle, logExpandButtonStyle } from './FunctionLog.styles';
import { useTranslation } from 'react-i18next';
interface FunctionLogProps {}

const FunctionLog: React.FC<FunctionLogProps> = props => {
  const { t } = useTranslation();

  return (
    <div>
      <div className={logCommandBarStyle}>
        <span className={logExpandButtonStyle}>
          <DownChevron className={chevronIconStyle()} />
          {t('logStreaming_logs')}
        </span>
      </div>
    </div>
  );
};

export default FunctionLog;
