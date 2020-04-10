import React from 'react';
import ConfigurationCommandBar from './ConfigurationCommandBar';

interface ConfigurationProps {}

const Configuration: React.FC<ConfigurationProps> = props => {
  return (
    <>
      <ConfigurationCommandBar />
      {`StaticSite Home`}
    </>
  );
};

export default Configuration;
