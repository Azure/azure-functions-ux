import React from 'react';

export interface LogStreamDataLoaderProps {
  resourceId: string;
}

const LogStreamDataLoader: React.FC<LogStreamDataLoaderProps> = props => {
  const { resourceId } = props;

  return <h2>{`Log Stream for function app ${resourceId}`}</h2>;
};

export default LogStreamDataLoader;
