import React, { useEffect, useState, useContext, useRef } from 'react';
import { DeploymentCenterFieldProps, DeploymentCenterContainerFormData } from '../DeploymentCenter.types';
import DeploymentCenterContainerAcrSettings from './DeploymentCenterContainerAcrSettings';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { IDropdownOption, MessageBarType } from 'office-ui-fabric-react';
import DeploymentCenterData from '../DeploymentCenter.data';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import { ACRCredential } from '../../../../models/acr';

const DeploymentCenterContainerAcrDataLoader: React.FC<DeploymentCenterFieldProps<DeploymentCenterContainerFormData>> = props => {
  const deploymentCenterData = new DeploymentCenterData();
  const deploymentCenterContext = useContext(DeploymentCenterContext);

  const [acrRegistryOptions, setAcrRegistryOptions] = useState<IDropdownOption[]>([]);
  const [acrImageOptions, setAcrImageOptions] = useState<IDropdownOption[]>([]);
  const [acrTagOptions, setAcrTagOptions] = useState<IDropdownOption[]>([]);
  const [acrStatusMessage, setAcrStatusMessage] = useState<string | undefined>(undefined);
  const [acrStatusMessageType, setAcrStatusMessageType] = useState<MessageBarType | undefined>(undefined);
  const registryCredentials = useRef<{ [key: string]: ACRCredential }>({});

  const fetchData = () => {
    setAcrRegistryOptions([]);
    setAcrImageOptions([]);
    setAcrTagOptions([]);
    setAcrStatusMessage(undefined);
    setAcrStatusMessageType(undefined);
    fetchRegistries();
  };

  const fetchRegistries = async () => {
    if (deploymentCenterContext.siteDescriptor) {
      const registriesResponse = await deploymentCenterData.getAcrRegistries(deploymentCenterContext.siteDescriptor.subscription);
      if (registriesResponse.metadata.success && registriesResponse.data) {
        const dropdownOptions = registriesResponse.data.value
          .filter(registry => registry.properties.adminUserEnabled)
          .map(registry => ({
            key: `${registry.properties.loginServer}:${registry.id}`,
            text: registry.name,
          }));

        setAcrRegistryOptions(dropdownOptions);
      } else {
        const errorMessage = getErrorMessage(registriesResponse.metadata.error);
        if (errorMessage) {
          setAcrStatusMessage(errorMessage);
          setAcrStatusMessageType(MessageBarType.error);
        }
      }
    }
  };

  const fetchRepositories = async (registrySelected: string) => {
    setAcrTagOptions([]);
    setAcrStatusMessage(undefined);
    setAcrStatusMessageType(undefined);

    const [loginServer, resourceId] = registrySelected.split(':');

    if (!registryCredentials.current[loginServer]) {
      const credentialsResponse = await deploymentCenterData.listAcrCredentials(resourceId);

      if (credentialsResponse.metadata.success && credentialsResponse.data.passwords && credentialsResponse.data.passwords.length > 0) {
        registryCredentials.current[loginServer] = credentialsResponse.data;
      } else {
        const errorMessage = getErrorMessage(credentialsResponse.metadata.error);
        if (errorMessage) {
          setAcrStatusMessage(errorMessage);
          setAcrStatusMessageType(MessageBarType.error);
        }
      }
    }

    const credentials = registryCredentials.current[loginServer];

    if (credentials) {
      const username = credentials.username;
      const password = credentials.passwords[0].value;

      const repositoriesResponse = await deploymentCenterData.getAcrRepositories(loginServer, username, password);

      const repositoryOptions: IDropdownOption[] = [];
      repositoriesResponse.forEach(response => {
        const dropdownOptions =
          response && response.repositories && response.repositories.length > 0
            ? response.repositories.map(repository => ({ key: repository, text: repository }))
            : [];
        repositoryOptions.push(...dropdownOptions);
      });

      setAcrImageOptions(repositoryOptions);
    }
  };

  const fetchTags = async (registrySelected: string, imageSelected: string) => {
    setAcrStatusMessage(undefined);
    setAcrStatusMessageType(undefined);

    const loginServer = registrySelected.split(':')[0];
    const credentials = registryCredentials.current[loginServer];

    if (credentials) {
      const username = credentials.username;
      const password = credentials.passwords[0].value;

      const tagsResponse = await deploymentCenterData.getAcrTags(loginServer, imageSelected, username, password);

      const tagOptions: IDropdownOption[] = [];
      tagsResponse.forEach(response => {
        const dropdownOptions =
          response && response.tags && response.tags.length > 0 ? response.tags.map(tag => ({ key: tag, text: tag })) : [];
        tagOptions.push(...dropdownOptions);
      });

      setAcrTagOptions(tagOptions);
    }
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deploymentCenterContext]);

  return (
    <DeploymentCenterContainerAcrSettings
      {...props}
      fetchImages={fetchRepositories}
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
