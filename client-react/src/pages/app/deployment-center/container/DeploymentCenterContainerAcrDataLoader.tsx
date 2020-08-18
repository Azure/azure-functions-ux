import React, { useEffect, useState } from 'react';
import { DeploymentCenterFieldProps, DeploymentCenterContainerFormData } from '../DeploymentCenter.types';
import DeploymentCenterContainerAcrSettings from './DeploymentCenterContainerAcrSettings';
import { SiteStateContext } from '../../../../SiteState';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { IDropdownOption, MessageBarType } from 'office-ui-fabric-react';

const DeploymentCenterContainerAcrDataLoader: React.FC<DeploymentCenterFieldProps<DeploymentCenterContainerFormData>> = props => {
  const [acrRegistryOptions, setAcrRegistryOptions] = useState<IDropdownOption[]>([]);
  const [acrImageOptions, setAcrImageOptions] = useState<IDropdownOption[]>([]);
  const [acrTagOptions, setAcrTagOptions] = useState<IDropdownOption[]>([]);
  const [acrStatusMessage, setAcrStatusMessage] = useState<string | undefined>(undefined);
  const [acrStatusMessageType, setAcrStatusMessageType] = useState<MessageBarType | undefined>(undefined);

  const fetchData = () => {
    setAcrRegistryOptions([]);
    setAcrImageOptions([]);
    setAcrTagOptions([]);
    setAcrStatusMessage(undefined);
    setAcrStatusMessageType(undefined);
  };

  const fetchImages = (registry: string) => {
    throw Error('Not Implemented');
  };

  const fetchTags = (registry: string, image: string) => {
    throw Error('Not Implemented');
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SiteStateContext, DeploymentCenterContext]);

  return (
    <DeploymentCenterContainerAcrSettings
      {...props}
      fetchImages={fetchImages}
      fetchTags={fetchTags}
      acrRegistryOptions={acrRegistryOptions}
      acrImageOptions={acrImageOptions}
      acrTagOptions={acrTagOptions}
      acrStatusMessage={acrStatusMessage}
      acrStatusMessageType={acrStatusMessageType}
    />
  );
};

export default DeploymentCenterContainerAcrDataLoader;
