import React from 'react';
import { XTerm } from 'xterm-for-react';

export interface ConsoleDataLoaderProps {
  resourceId: string;
}

const ConsoleDataLoader: React.FC<ConsoleDataLoaderProps> = props => {
  return <XTerm />;
};

export default ConsoleDataLoader;
