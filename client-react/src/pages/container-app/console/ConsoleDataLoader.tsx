import React from 'react';

export interface ConsoleDataLoaderProps {
  resourceId: string;
}

const ConsoleDataLoader: React.FC<ConsoleDataLoaderProps> = props => {
  return <div>{props.resourceId}</div>;
};

export default ConsoleDataLoader;
