import React, { useEffect, useState, useContext, useRef } from 'react';
import { DeploymentCenterFieldProps, DeploymentCenterContainerFormData } from '../DeploymentCenter.types';
import DeploymentCenterContainerAcrSettings from './DeploymentCenterContainerAcrSettings';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { IDropdownOption, MessageBarType } from 'office-ui-fabric-react';
import DeploymentCenterData from '../DeploymentCenter.data';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import { ACRCredential, ACRRepositories, ACRTags } from '../../../../models/acr';
import { getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import { PortalContext } from '../../../../PortalContext';
import { useTranslation } from 'react-i18next';
import { HttpResponseObject } from '../../../../ArmHelper.types';

interface RegistryIdentifiers {
  resourceId: string;
  location: string;
  credential?: ACRCredential;
}

const DeploymentCenterContainerAcrDataLoader: React.FC<DeploymentCenterFieldProps<DeploymentCenterContainerFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();

  const deploymentCenterData = new DeploymentCenterData();
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const portalContext = useContext(PortalContext);

  const [acrRegistryOptions, setAcrRegistryOptions] = useState<IDropdownOption[]>([]);
  const [acrImageOptions, setAcrImageOptions] = useState<IDropdownOption[]>([]);
  const [acrTagOptions, setAcrTagOptions] = useState<IDropdownOption[]>([]);
  const [acrStatusMessage, setAcrStatusMessage] = useState<string | undefined>(undefined);
  const [acrStatusMessageType, setAcrStatusMessageType] = useState<MessageBarType | undefined>(undefined);
  const [loadingRegistryOptions, setLoadingRegistryOptions] = useState(false);
  const [loadingImageOptions, setLoadingImageOptions] = useState(false);
  const [loadingTagOptions, setLoadingTagOptions] = useState(false);
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
      setLoadingRegistryOptions(true);

      portalContext.log(getTelemetryInfo('info', 'getAcrRegistries', 'submit'));
      const registriesResponse = await deploymentCenterData.getAcrRegistries(deploymentCenterContext.siteDescriptor.subscription);
      if (registriesResponse.metadata.success && registriesResponse.data) {
        if (registriesResponse.data.value.length > 0) {
          const dropdownOptions: IDropdownOption[] = [];

          registriesResponse.data.value.forEach(registry => {
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

          if (formProps.values.acrLoginServer) {
            fetchRepositories(formProps.values.acrLoginServer);
          }
        } else {
          setAcrStatusMessage(
            t('deploymentCenterContainerAcrRegistrieNotAvailable').format(deploymentCenterContext.siteDescriptor.subscription)
          );
          setAcrStatusMessageType(MessageBarType.warning);
        }
      } else {
        const errorMessage = getErrorMessage(registriesResponse.metadata.error);
        const statusMessage = errorMessage
          ? t('deploymentCenterContainerAcrFailedToLoadRegistriesWithError').format(errorMessage)
          : t('deploymentCenterContainerAcrFailedToLoadRegistries');

        setAcrStatusMessage(statusMessage);
        setAcrStatusMessageType(MessageBarType.error);

        portalContext.log(
          getTelemetryInfo('error', 'registriesResponse', 'failed', {
            message: getErrorMessage(registriesResponse.metadata.error),
            error: registriesResponse.metadata.error,
          })
        );
      }
    }

    setLoadingRegistryOptions(false);
  };

  const fetchRepositories = async (loginServer: string) => {
    setLoadingImageOptions(true);
    setAcrTagOptions([]);
    setAcrStatusMessage(undefined);
    setAcrStatusMessageType(undefined);

    const selectedRegistryIdentifier = registryIdentifiers.current[loginServer];

    if (!selectedRegistryIdentifier.credential) {
      portalContext.log(getTelemetryInfo('info', 'listAcrCredentials', 'submit'));
      const credentialsResponse = await deploymentCenterData.listAcrCredentials(selectedRegistryIdentifier.resourceId);

      if (credentialsResponse.metadata.success && credentialsResponse.data.passwords && credentialsResponse.data.passwords.length > 0) {
        registryIdentifiers.current[loginServer].credential = credentialsResponse.data;
      } else {
        const errorMessage = getErrorMessage(credentialsResponse.metadata.error);
        const statusMessage = errorMessage
          ? t('deploymentCenterContainerAcrFailedToLoadCredentialsWithError').format(errorMessage)
          : t('deploymentCenterContainerAcrFailedToLoadCredentials');

        setAcrStatusMessage(statusMessage);
        setAcrStatusMessageType(MessageBarType.error);

        portalContext.log(
          getTelemetryInfo('error', 'credentialsResponse', 'failed', {
            message: getErrorMessage(credentialsResponse.metadata.error),
            error: credentialsResponse.metadata.error,
          })
        );
      }
    }

    const credentials = registryIdentifiers.current[loginServer].credential;

    if (credentials) {
      const username = credentials.username;
      const password = credentials.passwords[0].value;
      let failedNetworkCall = false;
      let errorMessage = '';

      portalContext.log(getTelemetryInfo('info', 'getAcrRepositories', 'submit'));
      const repositoriesResponse = await deploymentCenterData.getAcrRepositories(
        loginServer,
        username,
        password,
        (page, response: HttpResponseObject<ACRRepositories>) => {
          portalContext.log(
            // NOTE(michinoy): 2021-02-04, Generally a bad idea to log the entire response object. But I am unable to identify what error is being returned,
            // thus logging the entire response object.
            getTelemetryInfo('error', 'getAcrRepositoriesResponse', 'failed', {
              page: page,
              error: response.metadata.error,
            })
          );

          failedNetworkCall = response.metadata.success;
          errorMessage = getErrorMessage(response.metadata.error);
        }
      );

      const repositoryOptions: IDropdownOption[] = [];
      repositoriesResponse.forEach(response => {
        const dropdownOptions =
          response && response.repositories && response.repositories.length > 0
            ? response.repositories.map(repository => ({ key: repository, text: repository }))
            : [];
        repositoryOptions.push(...dropdownOptions);
      });

      if (repositoryOptions.length === 0 && failedNetworkCall) {
        const statusMessage = errorMessage
          ? t('deploymentCenterContainerAcrFailedToLoadImagesWithError').format(errorMessage)
          : t('deploymentCenterContainerAcrFailedToLoadImages');

        setAcrStatusMessage(statusMessage);
        setAcrStatusMessageType(MessageBarType.error);
      }

      formProps.setFieldValue('acrResourceId', selectedRegistryIdentifier.resourceId);
      formProps.setFieldValue('acrLocation', selectedRegistryIdentifier.location);
      formProps.setFieldValue('acrUsername', username);
      formProps.setFieldValue('acrPassword', password);

      setAcrImageOptions(repositoryOptions);

      if (formProps.values.acrImage) {
        fetchTags(formProps.values.acrImage);
      }
    }

    setLoadingImageOptions(false);
  };

  const fetchTags = async (imageSelected: string) => {
    setLoadingTagOptions(true);
    setAcrStatusMessage(undefined);
    setAcrStatusMessageType(undefined);

    const loginServer = formProps.values.acrLoginServer;
    const credentials = registryIdentifiers.current[loginServer].credential;

    if (credentials) {
      const username = credentials.username;
      const password = credentials.passwords[0].value;
      let failedNetworkCall = false;
      let errorMessage = '';

      portalContext.log(getTelemetryInfo('info', 'getAcrTags', 'submit'));
      const tagsResponse = await deploymentCenterData.getAcrTags(
        loginServer,
        imageSelected,
        username,
        password,
        (page, response: HttpResponseObject<ACRTags>) => {
          portalContext.log(
            // NOTE(michinoy): 2021-02-04, Generally a bad idea to log the entire response object. But I am unable to identify what error is being returned,
            // thus logging the entire response object.
            getTelemetryInfo('error', 'getAcrTagsResponse', 'failed', {
              page: page,
              error: response.metadata.error,
            })
          );

          failedNetworkCall = response.metadata.success;
          errorMessage = getErrorMessage(response.metadata.error);
        }
      );

      const tagOptions: IDropdownOption[] = [];
      tagsResponse.forEach(response => {
        const dropdownOptions =
          response && response.tags && response.tags.length > 0 ? response.tags.map(tag => ({ key: tag, text: tag })) : [];
        tagOptions.push(...dropdownOptions);
      });

      if (tagOptions.length === 0 && failedNetworkCall) {
        const statusMessage = errorMessage
          ? t('deploymentCenterContainerAcrFailedToLoadTagsWithError').format(errorMessage)
          : t('deploymentCenterContainerAcrFailedToLoadTags');

        setAcrStatusMessage(statusMessage);
        setAcrStatusMessageType(MessageBarType.error);
      }

      setAcrTagOptions(tagOptions);
    }
    setLoadingTagOptions(false);
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deploymentCenterContext.siteDescriptor]);

  useEffect(() => {
    if (registryIdentifiers.current[formProps.values.acrLoginServer]) {
      fetchRepositories(formProps.values.acrLoginServer);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.acrLoginServer]);

  useEffect(() => {
    if (registryIdentifiers.current[formProps.values.acrLoginServer] && formProps.values.acrImage) {
      fetchTags(formProps.values.acrImage);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.acrLoginServer, formProps.values.acrImage]);

  return (
    <DeploymentCenterContainerAcrSettings
      {...props}
      fetchImages={fetchRepositories}
      fetchTags={fetchTags}
      acrRegistryOptions={acrRegistryOptions}
      acrImageOptions={acrImageOptions}
      acrTagOptions={acrTagOptions}
      loadingRegistryOptions={loadingRegistryOptions}
      loadingImageOptions={loadingImageOptions}
      loadingTagOptions={loadingTagOptions}
      acrStatusMessage={acrStatusMessage}
      acrStatusMessageType={acrStatusMessageType}
    />
  );
};

export default DeploymentCenterContainerAcrDataLoader;
