import React from 'react';

interface FunctionMonitorProps {
  resourceId: string;
}

const FunctionMonitor: React.FC<FunctionMonitorProps> = props => {
  return (
    <div>
      <h2>{'Hello there'}</h2>
    </div>
  );
};

export default FunctionMonitor;
