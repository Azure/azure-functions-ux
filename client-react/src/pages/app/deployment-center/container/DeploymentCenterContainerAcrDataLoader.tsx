import React, { useEffect, useState, useContext, useRef } from 'react';
import { DeploymentCenterFieldProps, DeploymentCenterContainerFormData } from '../DeploymentCenter.types';
import DeploymentCenterContainerAcrSettings from './DeploymentCenterContainerAcrSettings';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { IDropdownOption, MessageBarType } from 'office-ui-fabric-react';
import DeploymentCenterData from '../DeploymentCenter.data';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import { ACRCredential } from '../../../../models/acr';

interface RegistryIdentifiers {
  resourceId: string;
  location: string;
  credential?: ACRCredential;
}

const DeploymentCenterContainerAcrDataLoader: React.FC<DeploymentCenterFieldProps<DeploymentCenterContainerFormData>> = props => {
  const { formProps } = props;
  const deploymentCenterData = new DeploymentCenterData();
  const deploymentCenterContext = useContext(DeploymentCenterContext);

  const [acrRegistryOptions, setAcrRegistryOptions] = useState<IDropdownOption[]>([]);
  const [acrImageOptions, setAcrImageOptions] = useState<IDropdownOption[]>([]);
  const [acrTagOptions, setAcrTagOptions] = useState<IDropdownOption[]>([]);
  const [acrStatusMessage, setAcrStatusMessage] = useState<string | undefined>(undefined);
  const [acrStatusMessageType, setAcrStatusMessageType] = useState<MessageBarType | undefined>(undefined);
  const registryIdentifiers = useRef<{ [key: string]: RegistryIdentifiers }>({});

  const fetchData = () => {
    registryIdentifiers.current = {};
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
        const adminEnabledRegistries = registriesResponse.data.value.filter(registry => registry.properties.adminUserEnabled);
        const dropdownOptions: IDropdownOption[] = [];

        adminEnabledRegistries.forEach(registry => {
          registryIdentifiers.current[registry.properties.loginServer.toLocaleLowerCase()] = {
            resourceId: registry.id,
            location: registry.location,
          };

          dropdownOptions.push({
            key: registry.properties.loginServer.toLocaleLowerCase(),
            text: registry.name,
          });
        });

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

  const fetchRepositories = async (loginServer: string) => {
    setAcrTagOptions([]);
    setAcrStatusMessage(undefined);
    setAcrStatusMessageType(undefined);

    const selectedRegistryIdentifier = registryIdentifiers.current[loginServer];

    if (!selectedRegistryIdentifier.credential) {
      const credentialsResponse = await deploymentCenterData.listAcrCredentials(selectedRegistryIdentifier.resourceId);

      if (credentialsResponse.metadata.success && credentialsResponse.data.passwords && credentialsResponse.data.passwords.length > 0) {
        selectedRegistryIdentifier.credential = credentialsResponse.data;
      } else {
        const errorMessage = getErrorMessage(credentialsResponse.metadata.error);
        if (errorMessage) {
          setAcrStatusMessage(errorMessage);
          setAcrStatusMessageType(MessageBarType.error);
        }
      }
    }

    const credentials = selectedRegistryIdentifier.credential;

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

      formProps.setFieldValue('acrResourceId', selectedRegistryIdentifier.resourceId);
      formProps.setFieldValue('acrLocation', selectedRegistryIdentifier.location);
      formProps.setFieldValue('acrUsername', username);
      formProps.setFieldValue('acrPassword', password);

      setAcrImageOptions(repositoryOptions);
    }
  };

  const fetchTags = async (imageSelected: string) => {
    setAcrStatusMessage(undefined);
    setAcrStatusMessageType(undefined);

    const loginServer = formProps.values.acrLoginServer;
    const credentials = registryIdentifiers.current[loginServer].credential;

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

  useEffect(() => {
    if (registryIdentifiers.current[formProps.values.acrLoginServer]) {
      fetchRepositories(formProps.values.acrLoginServer);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registryIdentifiers.current[formProps.values.acrLoginServer], formProps.values.acrLoginServer]);

  useEffect(() => {
    if (registryIdentifiers.current[formProps.values.acrLoginServer] && formProps.values.acrImage) {
      fetchTags(formProps.values.acrImage);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registryIdentifiers.current[formProps.values.acrLoginServer], formProps.values.acrLoginServer, formProps.values.acrImage]);

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
