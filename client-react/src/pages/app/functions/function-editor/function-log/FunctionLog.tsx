import React from 'react';
import { ReactComponent as DownChevron } from './../../../../../images/Common/down-chevron.svg';
import { chevronIconStyle, logCommandBarStyle, logExpandButtonStyle } from './FunctionLog.styles';
interface FunctionLogProps {}

const FunctionLog: React.FC<FunctionLogProps> = props => {
  return (
    <div>
      <div className={logCommandBarStyle}>
        <span className={logExpandButtonStyle}>
          <DownChevron className={chevronIconStyle()} />
          Logs
        </span>
      </div>
    </div>
  );
};

export default FunctionLog;
