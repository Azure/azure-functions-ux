import React from 'react';
import ConfigurationData from './Configuration.data';
import Configuration from './Configuration';

const configurationData = new ConfigurationData();
export const ConfigurationContext = React.createContext(configurationData);

interface ConfigurationDataLoaderProps {
  resourceId: string;
}

const ConfigurationDataLoader: React.FC<ConfigurationDataLoaderProps> = props => {
  return (
    <ConfigurationContext.Provider value={configurationData}>
      <Configuration />
    </ConfigurationContext.Provider>
  );
};

export default ConfigurationDataLoader;
