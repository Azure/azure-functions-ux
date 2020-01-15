import React from 'react';
import { ReactComponent as DownChevron } from './../../../../../images/Common/down-chevron.svg';
import { chevronIconStyle, logCommandBarStyle, logExpandButtonStyle, logStreamStyle } from './FunctionLog.styles';
import { useTranslation } from 'react-i18next';
interface FunctionLogProps {
  toggleExpand: () => void;
  isExpanded: boolean;
}

const FunctionLog: React.FC<FunctionLogProps> = props => {
  const { t } = useTranslation();
  const { toggleExpand, isExpanded } = props;

  const onExpandClick = () => {
    toggleExpand();
  };

  return (
    <div>
      <div className={logCommandBarStyle}>
        <span className={logExpandButtonStyle} onClick={onExpandClick}>
          <DownChevron className={chevronIconStyle(isExpanded)} />
          {t('logStreaming_logs')}
        </span>
      </div>
      {isExpanded && <div className={logStreamStyle} />}
    </div>
  );
};

export default FunctionLog;
