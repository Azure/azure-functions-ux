import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  DeploymentCenterFieldProps,
  DeploymentCenterContainerFormData,
  ACRCredentialType,
  ACRManagedIdentityType,
  ManagedIdentityInfo,
  UserAssignedIdentity,
} from '../DeploymentCenter.types';
import DeploymentCenterContainerAcrSettings from './DeploymentCenterContainerAcrSettings';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { IComboBoxOption, IDropdownOption, MessageBarType, SelectableOptionMenuItemType } from '@fluentui/react';
import DeploymentCenterData from '../DeploymentCenter.data';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import { ACRCredential, ACRRepositories, ACRTags } from '../../../../models/acr';
import { getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import { PortalContext } from '../../../../PortalContext';
import { useTranslation } from 'react-i18next';
import { HttpResponseObject } from '../../../../ArmHelper.types';
import { DeploymentCenterConstants } from '../DeploymentCenterConstants';
import { AcrDependency } from '../../../../utils/dependency/Dependency';
import { CommonConstants } from '../../../../utils/CommonConstants';
interface RegistryIdentifiers {
  resourceId: string;
  location: string;
  credential?: ACRCredential;
  adminUserEnabled: boolean;
  name: string;
}

const DeploymentCenterContainerAcrDataLoader: React.FC<DeploymentCenterFieldProps<DeploymentCenterContainerFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();

  const deploymentCenterData = new DeploymentCenterData();
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const portalContext = useContext(PortalContext);
  const [subscription, setSubscription] = useState<string>(deploymentCenterContext.siteDescriptor?.subscription ?? '');
  const [acrUseManagedIdentities, setAcrUseManagedIdentities] = useState<boolean>(
    !!deploymentCenterContext.siteConfig && !!deploymentCenterContext.siteConfig.properties
      ? deploymentCenterContext.siteConfig.properties.acrUseManagedIdentityCreds
      : false
  );
  const [acrRegistryOptions, setAcrRegistryOptions] = useState<IDropdownOption[]>([]);
  const [acrImageOptions, setAcrImageOptions] = useState<IDropdownOption[]>([]);
  const [acrTagOptions, setAcrTagOptions] = useState<IDropdownOption[]>([]);
  const [acrStatusMessage, setAcrStatusMessage] = useState<string | undefined>(undefined);
  const [acrStatusMessageType, setAcrStatusMessageType] = useState<MessageBarType | undefined>(undefined);
  const [loadingRegistryOptions, setLoadingRegistryOptions] = useState(false);
  const [loadingImageOptions, setLoadingImageOptions] = useState(false);
  const [loadingTagOptions, setLoadingTagOptions] = useState(false);
  const registryIdentifiers = useRef<{ [key: string]: RegistryIdentifiers }>({});
  const [subscriptionOptions, setSubscriptionOptions] = useState<IDropdownOption[]>([]);
  const [managedIdentityOptions, setManagedIdentityOptions] = useState<IComboBoxOption[]>([]);
  const [loadingManagedIdentities, setLoadingManagedIdentities] = useState(true);
  const [learnMoreLink, setLearnMoreLink] = useState<string | undefined>(undefined);
  const managedIdentityInfo = useRef<{ [key: string]: UserAssignedIdentity }>({});

  const fetchData = () => {
    fetchAllSubscriptions();
    registryIdentifiers.current = {};
    setAcrRegistryOptions([]);
    setAcrImageOptions([]);
    setAcrTagOptions([]);
    setAcrStatusMessage(undefined);
    setAcrStatusMessageType(undefined);
    setLearnMoreLink(undefined);
    fetchRegistries();
  };

  const fetchRegistries = async () => {
    if (deploymentCenterContext.siteDescriptor) {
      setLoadingRegistryOptions(true);

      const appSettingServerUrl =
        deploymentCenterContext.applicationSettings &&
        deploymentCenterContext.applicationSettings.properties[DeploymentCenterConstants.serverUrlSetting]
          ? deploymentCenterContext.applicationSettings.properties[DeploymentCenterConstants.serverUrlSetting]
              .toLocaleLowerCase()
              .replace(CommonConstants.DeploymentCenterConstants.https, '')
          : '';

      const appSettingUsername = deploymentCenterContext.applicationSettings
        ? deploymentCenterContext.applicationSettings.properties[DeploymentCenterConstants.usernameSetting]
        : '';

      const appSettingPassword = deploymentCenterContext.applicationSettings
        ? deploymentCenterContext.applicationSettings.properties[DeploymentCenterConstants.passwordSetting]
        : '';

      portalContext.log(getTelemetryInfo('info', 'getAcrRegistries', 'submit'));
      const registriesResponse = await deploymentCenterData.getAcrRegistries(subscription);
      if (registriesResponse.metadata.success && registriesResponse.data) {
        if (registriesResponse.data.value.length > 0) {
          setAcrStatusMessage('');
          const dropdownOptions: IDropdownOption[] = [];

          //Check to see if the acr exists in the current subscription
          const isAcrInSameSubscription = registriesResponse.data.value.some(
            registry => registry.properties.loginServer.toLocaleLowerCase() === formProps.values.acrLoginServer.toLocaleLowerCase()
          );

          if (!isAcrInSameSubscription && formProps.values.acrLoginServer) {
            await fetchHiddenAcrTag();
          }

          registriesResponse.data.value.forEach(registry => {
            const loginServer = registry.properties.loginServer;

            registryIdentifiers.current[loginServer] = {
              resourceId: registry.id,
              location: registry.location,
              adminUserEnabled: registry.properties.adminUserEnabled,
              name: registry.name,
            };

            // NOTE(michinoy): If we already have the app settings with username and password, use that to reduce
            // an extra call. Like this IF the registry is setup manually, there is no need to dispatch the call to
            // get credentials.
            if (appSettingServerUrl === loginServer && !!appSettingUsername && !!appSettingPassword) {
              registryIdentifiers.current[loginServer].credential = {
                username: appSettingUsername,
                passwords: [
                  {
                    name: 'primary',
                    value: appSettingPassword,
                  },
                ],
              };
            }

            dropdownOptions.push({
              key: loginServer,
              text: registry.name,
            });
          });

          setAcrRegistryOptions(dropdownOptions);

          if (formProps.values.acrLoginServer) {
            fetchRepositories(formProps.values.acrLoginServer);
            setAcrResourceId();
          }
        } else {
          // We don't have any containers in the current sub, check for the hidden tag anyway
          if (formProps.values.acrLoginServer) {
            await fetchHiddenAcrTag();
          } else {
            setAcrStatusMessage(t('deploymentCenterContainerAcrRegistriesNotAvailable').format(subscription));
            setAcrStatusMessageType(MessageBarType.warning);
          }
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
    if (!acrUseManagedIdentities) {
      setLoadingImageOptions(true);
      setAcrTagOptions([]);
      setAcrStatusMessage(undefined);
      setAcrStatusMessageType(undefined);
      setLearnMoreLink(undefined);
      const serverUrl = loginServer?.toLocaleLowerCase() ?? '';

      const selectedRegistryIdentifier = registryIdentifiers.current[serverUrl];

      if (selectedRegistryIdentifier) {
        if (selectedRegistryIdentifier.adminUserEnabled) {
          if (!selectedRegistryIdentifier.credential) {
            portalContext.log(getTelemetryInfo('info', 'listAcrCredentials', 'submit'));
            const credentialsResponse = await deploymentCenterData.listAcrCredentials(selectedRegistryIdentifier.resourceId);

            if (
              credentialsResponse.metadata.success &&
              credentialsResponse.data.passwords &&
              credentialsResponse.data.passwords.length > 0
            ) {
              registryIdentifiers.current[serverUrl].credential = credentialsResponse.data;
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

          const credentials = registryIdentifiers.current[serverUrl] ? registryIdentifiers.current[serverUrl].credential : undefined;

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
                  ? response.repositories.map(repository => ({ key: repository.toLocaleLowerCase(), text: repository }))
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
        } else {
          setAcrStatusMessage(t('acrCredentialsWarningMessage').format(selectedRegistryIdentifier.name));
          setAcrStatusMessageType(MessageBarType.warning);
          setLearnMoreLink(DeploymentCenterConstants.authOptionsLink);
        }
      }
      setLoadingImageOptions(false);
    }
  };

  const fetchTags = async (imageSelected: string) => {
    if (!acrUseManagedIdentities) {
      setLoadingTagOptions(true);
      setAcrStatusMessage(undefined);
      setAcrStatusMessageType(undefined);
      setLearnMoreLink(undefined);
      const loginServer = formProps.values.acrLoginServer?.toLocaleLowerCase() ?? '';
      const selectedRegistryIdentifier = registryIdentifiers.current[loginServer];

      if (selectedRegistryIdentifier) {
        if (selectedRegistryIdentifier.adminUserEnabled) {
          const credentials = selectedRegistryIdentifier.credential;
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
        } else {
          setAcrStatusMessage(t('acrCredentialsWarningMessage').format(selectedRegistryIdentifier.name));
          setAcrStatusMessageType(MessageBarType.warning);
          setLearnMoreLink(DeploymentCenterConstants.authOptionsLink);
        }
      }
      setLoadingTagOptions(false);
    }
  };

  const fetchAllSubscriptions = async () => {
    const subscriptionsObservable = await portalContext.getAllSubscriptions();
    const subscriptionDropdownOptions: IDropdownOption[] = [];

    subscriptionsObservable.subscribe(subscriptionArray => {
      subscriptionArray.forEach(subscription =>
        subscriptionDropdownOptions.push({ key: subscription.subscriptionId, text: subscription.displayName })
      );
      setSubscriptionOptions(subscriptionDropdownOptions);
      setSubscription(subscription);
    });
  };

  const fetchHiddenAcrTag = async () => {
    const acrTagInstance = new AcrDependency();
    const hiddenTag = await acrTagInstance.getTag(
      portalContext,
      deploymentCenterContext.resourceId,
      CommonConstants.DeploymentCenterConstants.acrTag,
      true
    );
    if (hiddenTag) {
      //has ACR in another subscription
      parseHiddenTag(hiddenTag);
    } else {
      // acrName is case-sensitive, so pull name from application settings if possible
      let acrName = '';
      if (deploymentCenterContext?.applicationSettings?.properties[DeploymentCenterConstants.usernameSetting]) {
        acrName = deploymentCenterContext.applicationSettings.properties[DeploymentCenterConstants.usernameSetting];
      } else {
        acrName = getAcrNameFromLoginServer(formProps.values.acrLoginServer);
      }

      const newSubscriptionId = await acrTagInstance.updateTags(portalContext, deploymentCenterContext.resourceId, acrName);

      if (newSubscriptionId) {
        setSubscription(newSubscriptionId);
      }
    }
  };

  const fetchManagedIdentityOptions = async () => {
    setLoadingManagedIdentities(true);
    const identities: IComboBoxOption[] = [
      { key: ACRManagedIdentityType.systemAssigned, text: t('systemAssigned') },
      { key: ACRManagedIdentityType.userAssigned, text: t('userAssigned'), itemType: SelectableOptionMenuItemType.Header },
    ];

    const response = await deploymentCenterData.fetchSite(deploymentCenterContext.resourceId);
    if (response.metadata.success) {
      if (!!response.data.identity && !!response.data.identity.userAssignedIdentities) {
        const userAssignedIdentities = response.data.identity.userAssignedIdentities;

        for (const id in userAssignedIdentities) {
          const idSplit = id.split('/');
          if (idSplit) {
            const identityName = idSplit[idSplit.length - 1];
            if (userAssignedIdentities[id]) {
              const clientId = userAssignedIdentities[id][ManagedIdentityInfo.clientId];
              const principalId = userAssignedIdentities[id][ManagedIdentityInfo.principalId];
              identities.push({ key: clientId, text: identityName });
              managedIdentityInfo.current[clientId] = {
                clientId,
                principalId,
                name: identityName,
              };
            }
          }
        }
      }
    }

    setManagedIdentityOptions(identities);
    setManagedIdentityType();
    setLoadingManagedIdentities(false);
  };

  const setManagedIdentityType = () => {
    if (!!deploymentCenterContext.siteConfig && !!deploymentCenterContext.siteConfig.properties) {
      if (acrUseManagedIdentities) {
        formProps.values.acrManagedIdentityType =
          deploymentCenterContext.siteConfig.properties.acrUserManagedIdentityID || ACRManagedIdentityType.systemAssigned;
        setManagedIdentityPrincipalId();
      } else {
        formProps.values.acrManagedIdentityType = '';
      }
    }
  };

  const getAcrNameFromLoginServer = (loginServer: string): string => {
    const loginServerParts = loginServer?.split('.') ?? [];
    return loginServerParts.length > 0 ? loginServerParts[0] : '';
  };

  const parseHiddenTag = (tagValue: string) => {
    try {
      if (tagValue) {
        const tagJson = JSON.parse(tagValue);
        const subId = tagJson['subscriptionId'] ? tagJson['subscriptionId'] : '';
        setSubscription(subId);
      }
    } catch {
      portalContext.log(getTelemetryInfo('error', 'parseHiddenTag', 'failed'));
    }
  };

  const setRegistriesInSub = (subscription: string) => {
    formProps.setFieldValue('acrLoginServer', '');
    formProps.setFieldValue('acrImage', '');
    formProps.setFieldValue('acrTag', '');
    setAcrRegistryOptions([]);
    setAcrImageOptions([]);
    setAcrTagOptions([]);
    setSubscription(subscription);
  };

  const openIdentityBlade = async () => {
    const response = await portalContext.openBlade({
      detailBlade: 'AzureResourceIdentitiesBladeV2',
      extension: 'Microsoft_Azure_ManagedServiceIdentity',
      detailBladeInputs: {
        resourceId: deploymentCenterContext.resourceId,
        apiVersion: CommonConstants.ApiVersions.antaresApiVersion20181101,
        systemAssignedStatus: 2, // IdentityStatus.Supported
        userAssignedStatus: 2, // IdentityStatus.Supported
      },
    });
    if (response) {
      fetchManagedIdentityOptions();
    }
  };

  const setManagedIdentityPrincipalId = () => {
    if (!!formProps.values.acrManagedIdentityType && managedIdentityInfo.current[formProps.values.acrManagedIdentityType]) {
      formProps.values.acrManagedIdentityPrincipalId = managedIdentityInfo.current[formProps.values.acrManagedIdentityType].principalId;
    }
  };

  const setAcrResourceId = () => {
    if (!!formProps.values.acrLoginServer && !!registryIdentifiers.current[formProps.values.acrLoginServer]) {
      formProps.values.acrResourceId = registryIdentifiers.current[formProps.values.acrLoginServer].resourceId;
    }
  };

  useEffect(() => {
    if (deploymentCenterContext.siteDescriptor && deploymentCenterContext.applicationSettings) {
      fetchData();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deploymentCenterContext.siteDescriptor, deploymentCenterContext.applicationSettings]);

  useEffect(() => {
    if (registryIdentifiers.current[formProps.values.acrLoginServer]) {
      fetchRepositories(formProps.values.acrLoginServer);
      setAcrResourceId();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.acrLoginServer]);

  useEffect(() => {
    if (registryIdentifiers.current[formProps.values.acrLoginServer] && formProps.values.acrImage) {
      fetchTags(formProps.values.acrImage);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.acrLoginServer, formProps.values.acrImage]);

  useEffect(() => {
    fetchRegistries();
    if (acrUseManagedIdentities) {
      portalContext.log(
        getTelemetryInfo('info', 'acrUseManagedIdentityCredsConfigured', 'submit', {
          resourceId: deploymentCenterContext.resourceId,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscription]);

  useEffect(() => {
    setAcrUseManagedIdentities(formProps.values.acrCredentialType === ACRCredentialType.managedIdentity);
    fetchManagedIdentityOptions();
  }, [formProps.values.acrCredentialType]);

  useEffect(() => {
    setManagedIdentityPrincipalId();
  }, [formProps.values.acrManagedIdentityType]);

  useEffect(() => {
    fetchRegistries();
  }, [acrUseManagedIdentities]);

  return (
    <DeploymentCenterContainerAcrSettings
      {...props}
      fetchImages={fetchRepositories}
      fetchTags={fetchTags}
      fetchRegistriesInSub={setRegistriesInSub}
      acrSubscriptionOptions={subscriptionOptions}
      acrRegistryOptions={acrRegistryOptions}
      acrImageOptions={acrImageOptions}
      acrTagOptions={acrTagOptions}
      loadingRegistryOptions={loadingRegistryOptions}
      loadingImageOptions={loadingImageOptions}
      loadingTagOptions={loadingTagOptions}
      acrStatusMessage={acrStatusMessage}
      acrStatusMessageType={acrStatusMessageType}
      acrSubscription={subscription}
      acrUseManagedIdentities={acrUseManagedIdentities}
      managedIdentityOptions={managedIdentityOptions}
      loadingManagedIdentities={loadingManagedIdentities}
      learnMoreLink={learnMoreLink}
      openIdentityBlade={openIdentityBlade}
    />
  );
};

export default DeploymentCenterContainerAcrDataLoader;
