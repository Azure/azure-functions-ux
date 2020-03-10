import React from 'react';
import FunctionMonitor from './FunctionMonitor';

interface FunctionMonitorDataLoaderProps {
  resourceId: string;
}

const FunctionMonitorDataLoader: React.FC<FunctionMonitorDataLoaderProps> = props => {
  const { resourceId } = props;
  return <FunctionMonitor resourceId={resourceId} />;
};

export default FunctionMonitorDataLoader;
