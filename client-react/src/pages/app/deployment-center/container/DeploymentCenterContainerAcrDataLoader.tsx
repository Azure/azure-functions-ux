import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { IComboBoxOption, IDropdownOption, MessageBarType, SelectableOptionMenuItemType } from '@fluentui/react';

import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import { ACRCredential } from '../../../../models/acr';
import { IDataMessageResult } from '../../../../models/portal-models';
import { ScmType } from '../../../../models/site/config';
import { PortalContext } from '../../../../PortalContext';
import { SiteStateContext } from '../../../../SiteState';
import { CommonConstants } from '../../../../utils/CommonConstants';
import { AcrDependency } from '../../../../utils/dependency/Dependency';
import { isPortalCommunicationStatusSuccess } from '../../../../utils/portal-utils';
import DeploymentCenterData from '../DeploymentCenter.data';
import {
  ACRCredentialType,
  DeploymentCenterContainerFormData,
  DeploymentCenterFieldProps,
  ManagedIdentityType,
  SettingOption,
  UserAssignedIdentity,
} from '../DeploymentCenter.types';
import { DeploymentCenterConstants } from '../DeploymentCenterConstants';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { getTelemetryInfo, optionsSortingFunction } from '../utility/DeploymentCenterUtility';

import DeploymentCenterContainerAcrSettings from './DeploymentCenterContainerAcrSettings';
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
  const siteStateContext = useContext(SiteStateContext);
  const portalContext = useContext(PortalContext);
  const [subscription, setSubscription] = useState<string>(deploymentCenterContext.siteDescriptor?.subscription ?? '');
  const [subscriptionOptions, setSubscriptionOptions] = useState<IDropdownOption[]>([]);
  const [acrUseManagedIdentities, setAcrUseManagedIdentities] = useState<boolean>(
    deploymentCenterContext.siteConfig?.properties.acrUseManagedIdentityCreds ?? false
  );
  const [managedIdentityOptions, setManagedIdentityOptions] = useState<IComboBoxOption[]>([]);
  const [acrRegistryOptions, setAcrRegistryOptions] = useState<IDropdownOption[]>([]);
  const [acrImageOptions, setAcrImageOptions] = useState<IDropdownOption[]>([]);
  const [acrTagOptions, setAcrTagOptions] = useState<IDropdownOption[]>([]);
  const [loadingManagedIdentities, setLoadingManagedIdentities] = useState(true);
  const [loadingRegistryOptions, setLoadingRegistryOptions] = useState(false);
  const [loadingImageOptions, setLoadingImageOptions] = useState(false);
  const [loadingTagOptions, setLoadingTagOptions] = useState(false);
  const [acrStatusMessage, setAcrStatusMessage] = useState<string | undefined>(undefined);
  const [acrStatusMessageType, setAcrStatusMessageType] = useState<MessageBarType | undefined>(undefined);
  const [learnMoreLink, setLearnMoreLink] = useState<string | undefined>(undefined);
  const registryIdentifiers = useRef<{ [key: string]: RegistryIdentifiers }>({});
  const managedIdentityInfo = useRef<{ [key: string]: UserAssignedIdentity }>({});
  const isVnetConfigured = useMemo(() => !!siteStateContext.site?.properties.virtualNetworkSubnetId, [
    siteStateContext.site?.properties.virtualNetworkSubnetId,
  ]);
  const legacyVnetAppSetting = useMemo(
    () => deploymentCenterContext.applicationSettings?.properties[DeploymentCenterConstants.vnetImagePullSetting],
    [deploymentCenterContext.applicationSettings?.properties[DeploymentCenterConstants.vnetImagePullSetting]]
  );
  const defaultVnetImagePullSetting = useMemo(() => {
    if (isVnetConfigured) {
      if (legacyVnetAppSetting) {
        return legacyVnetAppSetting === 'true' ? SettingOption.on : SettingOption.off;
      }
      return siteStateContext.site?.properties.vnetImagePullEnabled ? SettingOption.on : SettingOption.off;
    }
    return undefined;
  }, [isVnetConfigured, legacyVnetAppSetting, siteStateContext.site?.properties.vnetImagePullEnabled]);

  const fetchData = () => {
    clearStatusBanner();
    fetchAllSubscriptions();
  };

  const fetchRegistries = async () => {
    if (deploymentCenterContext.siteDescriptor) {
      setLoadingRegistryOptions(true);
      setAcrRegistryOptions([]);
      registryIdentifiers.current = {};
      clearStatusBanner();

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
          const dropdownOptions: IDropdownOption[] = [];

          //Check to see if the acr exists in the current subscription
          const isAcrInSameSubscription = registriesResponse.data.value.some(
            registry => registry.properties.loginServer.toLocaleLowerCase() === formProps.values.acrLoginServer.toLocaleLowerCase()
          );

          if (formProps.values.acrLoginServer) {
            if (!isAcrInSameSubscription) {
              await fetchHiddenAcrTag();
            } else if (isAcrInSameSubscription && subscription === deploymentCenterContext.siteDescriptor?.subscription) {
              await deleteHiddenAcrTag();
            }
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
            if (!acrUseManagedIdentities) {
              fetchRepositories(formProps.values.acrLoginServer);
            } else {
              setAcrResourceId(formProps.values.acrLoginServer);
            }
          }
        } else {
          // We don't have any containers in the current sub, check for the hidden tag anyway
          if (formProps.values.acrLoginServer) {
            await fetchHiddenAcrTag();
          } else {
            setStatusBanner(t('deploymentCenterContainerAcrRegistriesNotAvailable').format(subscription), MessageBarType.warning);
          }
        }
      } else {
        const errorMessage = getErrorMessage(registriesResponse.metadata.error);
        const statusMessage = errorMessage
          ? t('deploymentCenterContainerAcrFailedToLoadRegistriesWithError').format(errorMessage)
          : t('deploymentCenterContainerAcrFailedToLoadRegistries');
        setStatusBanner(statusMessage, MessageBarType.error);

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

  const fetchRepositories = async (loginServer: string, clearValues?: boolean) => {
    setLoadingImageOptions(true);
    if (clearValues) {
      formProps.values.acrImage = '';
      formProps.values.acrTag = '';
      setAcrImageOptions([]);
      setAcrTagOptions([]);
    }
    clearStatusBanner();
    const serverUrl = loginServer?.toLocaleLowerCase() ?? '';
    const selectedRegistryIdentifier = registryIdentifiers.current[serverUrl];

    if (selectedRegistryIdentifier) {
      if (selectedRegistryIdentifier.adminUserEnabled) {
        if (!selectedRegistryIdentifier.credential) {
          portalContext.log(getTelemetryInfo('info', 'listAcrCredentials', 'submit'));
          const credentialsResponse = await deploymentCenterData.listAcrCredentials(selectedRegistryIdentifier.resourceId);

          if (credentialsResponse.metadata.success && credentialsResponse.data.passwords.length > 0) {
            registryIdentifiers.current[serverUrl].credential = credentialsResponse.data;
          } else {
            const errorMessage = getErrorMessage(credentialsResponse.metadata.error);
            const statusMessage = errorMessage
              ? t('deploymentCenterContainerAcrFailedToLoadCredentialsWithError').format(errorMessage)
              : t('deploymentCenterContainerAcrFailedToLoadCredentials');

            setStatusBanner(statusMessage, MessageBarType.error);

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
            portalContext,
            loginServer,
            username,
            password,
            (page, response: IDataMessageResult<any>) => {
              portalContext.log(
                // NOTE(michinoy): 2021-02-04, Generally a bad idea to log the entire response object. But I am unable to identify what error is being returned,
                // thus logging the entire response object.
                getTelemetryInfo('error', 'getAcrRepositoriesResponse', 'failed', {
                  page: page,
                  error: response.status,
                })
              );

              failedNetworkCall = !isPortalCommunicationStatusSuccess(response.status);
              errorMessage = getErrorMessage(response.status);
            }
          );

          const repositoryOptions: IDropdownOption[] = [];
          repositoriesResponse.forEach(response => {
            const dropdownOptions =
              response?.repositories?.map(repository => ({ key: repository.toLocaleLowerCase(), text: repository })) ?? [];
            repositoryOptions.push(...dropdownOptions);
          });

          if (repositoryOptions.length === 0 && failedNetworkCall) {
            const statusMessage = errorMessage
              ? t('deploymentCenterContainerAcrFailedToLoadImagesWithError').format(errorMessage)
              : t('deploymentCenterContainerAcrFailedToLoadImages');

            setStatusBanner(statusMessage, MessageBarType.error);
          } else {
            formProps.setFieldValue('acrResourceId', selectedRegistryIdentifier.resourceId);
            formProps.setFieldValue('acrLocation', selectedRegistryIdentifier.location);
            formProps.setFieldValue('acrUsername', username);
            formProps.setFieldValue('acrPassword', password);

            setAcrImageOptions(repositoryOptions);

            if (formProps.values.acrImage && !acrUseManagedIdentities) {
              fetchTags(formProps.values.acrImage, clearValues);
            }
          }
        }
      } else {
        setStatusBanner(
          t('acrCredentialsWarningMessage').format(selectedRegistryIdentifier.name),
          MessageBarType.warning,
          DeploymentCenterConstants.authOptionsLink
        );
      }
    }
    setLoadingImageOptions(false);
  };

  const fetchTags = async (imageSelected: string, clearValues?: boolean) => {
    setLoadingTagOptions(true);
    if (clearValues) {
      formProps.values.acrTag = '';
      setAcrTagOptions([]);
    }
    clearStatusBanner();
    const loginServer = formProps.values.acrLoginServer?.toLocaleLowerCase() ?? '';
    const selectedRegistryIdentifier = registryIdentifiers.current[loginServer];

    if (selectedRegistryIdentifier && formProps.values.scmType !== ScmType.GitHubAction) {
      if (selectedRegistryIdentifier.adminUserEnabled) {
        const credentials = selectedRegistryIdentifier.credential;
        if (credentials) {
          const username = credentials.username;
          const password = credentials.passwords[0].value;
          let failedNetworkCall = false;
          let errorMessage = '';

          portalContext.log(getTelemetryInfo('info', 'getAcrTags', 'submit'));

          const tagsResponse = await deploymentCenterData.getAcrTags(
            portalContext,
            loginServer,
            imageSelected,
            username,
            password,
            (page, response: IDataMessageResult<any>) => {
              portalContext.log(
                // NOTE(michinoy): 2021-02-04, Generally a bad idea to log the entire response object. But I am unable to identify what error is being returned,
                // thus logging the entire response object.
                getTelemetryInfo('error', 'getAcrTagsResponse', 'failed', {
                  page: page,
                  error: response.status,
                })
              );

              failedNetworkCall = !isPortalCommunicationStatusSuccess(response.status);
              errorMessage = getErrorMessage(response.status);
            }
          );

          const tagOptions: IDropdownOption[] = [];
          tagsResponse.forEach(response => {
            const dropdownOptions = response?.tags?.map(tag => ({ key: tag, text: tag })) ?? [];
            tagOptions.push(...dropdownOptions);
          });

          if (tagOptions.length === 0 && failedNetworkCall) {
            const statusMessage = errorMessage
              ? t('deploymentCenterContainerAcrFailedToLoadTagsWithError').format(errorMessage)
              : t('deploymentCenterContainerAcrFailedToLoadTags');

            setStatusBanner(statusMessage, MessageBarType.error);
          }

          setAcrTagOptions(tagOptions);
        }
      } else {
        setStatusBanner(
          t('acrCredentialsWarningMessage').format(selectedRegistryIdentifier.name),
          MessageBarType.warning,
          DeploymentCenterConstants.authOptionsLink
        );
      }
    }
    setLoadingTagOptions(false);
  };

  const fetchAllSubscriptions = async () => {
    const subscriptionsObservable = await portalContext.getAllSubscriptions();
    const subscriptionDropdownOptions: IDropdownOption[] = [];

    subscriptionsObservable.subscribe(subscriptionArray => {
      subscriptionArray.forEach(subscription =>
        subscriptionDropdownOptions.push({ key: subscription.subscriptionId, text: subscription.displayName })
      );
      subscriptionDropdownOptions.sort(optionsSortingFunction);
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
    const acrName = getAcrNameFromLoginServer(formProps.values.acrLoginServer);

    if (hiddenTag) {
      const discoverAcrResponse = await acrTagInstance.discoverResourceId(portalContext, acrName);
      if (discoverAcrResponse?.subscriptionId && hiddenTag) {
        const hiddenTagSub = parseHiddenTag(hiddenTag);
        const isAcrInSameHiddenSub = discoverAcrResponse.subscriptionId === hiddenTagSub;
        if (isAcrInSameHiddenSub) {
          setSubscription(hiddenTagSub);
        } else {
          updateHiddenAcrTag(acrTagInstance, acrName);
        }
      }
    } else {
      updateHiddenAcrTag(acrTagInstance, acrName);
    }
  };

  const updateHiddenAcrTag = async (acrTagInstance: AcrDependency, acrName: string) => {
    const updatedTagSubId = await acrTagInstance.updateTags(portalContext, deploymentCenterContext.resourceId, acrName);
    if (updatedTagSubId) {
      setSubscription(updatedTagSubId);
    }
  };

  const deleteHiddenAcrTag = async () => {
    const acrTagInstance = new AcrDependency();
    await acrTagInstance.deleteTag(portalContext, deploymentCenterContext.resourceId);
  };

  const fetchManagedIdentityOptions = async () => {
    setLoadingManagedIdentities(true);
    clearStatusBanner();

    const userAssignedIdentitiesOptions: IComboBoxOption[] = [];
    // NOTE(yoonaoh): Have to call fetchSite instead of using siteStateContext to refresh the list of identities
    portalContext.log(getTelemetryInfo('info', 'getManagedIdentities', 'submit'));
    const siteResponse = await deploymentCenterData.fetchSite(deploymentCenterContext.resourceId);
    if (siteResponse.metadata.success && siteResponse.data.identity?.userAssignedIdentities) {
      for (const [id, identity] of Object.entries(siteResponse.data.identity.userAssignedIdentities)) {
        const clientId = identity.clientId;
        const principalId = identity.principalId;
        const name = id.split(CommonConstants.singleForwardSlash).pop() || clientId;
        managedIdentityInfo.current[clientId] = { clientId, principalId, name };
        userAssignedIdentitiesOptions.push({ key: clientId, text: name });
      }
    }

    userAssignedIdentitiesOptions.sort(optionsSortingFunction);

    const identities: IComboBoxOption[] = [
      { key: ManagedIdentityType.systemAssigned, text: t('systemAssigned') },
      { key: ManagedIdentityType.userAssigned, text: t('userAssigned'), itemType: SelectableOptionMenuItemType.Header },
      ...userAssignedIdentitiesOptions,
    ];
    setManagedIdentityOptions(identities);
    setLoadingManagedIdentities(false);
  };

  const getAcrNameFromLoginServer = (loginServer: string): string => {
    const loginServerParts = loginServer?.split('.') ?? [];
    return loginServerParts.length > 0 ? loginServerParts[0] : '';
  };

  const parseHiddenTag = (tagValue: string) => {
    try {
      if (tagValue) {
        const tagJson = JSON.parse(tagValue);
        return tagJson['subscriptionId'] ? tagJson['subscriptionId'] : '';
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

  const setManagedIdentityPrincipalId = (clientId: string) => {
    formProps.values.acrManagedIdentityPrincipalId = managedIdentityInfo.current[clientId]?.principalId || '';
  };

  const setAcrResourceId = (acrLoginServer: string) => {
    formProps.values.acrResourceId = registryIdentifiers.current[acrLoginServer]?.resourceId || '';
  };

  const setStatusBanner = (message: string, messageType: MessageBarType, learnMoreLink?: string) => {
    setAcrStatusMessage(message);
    setAcrStatusMessageType(messageType);
    setLearnMoreLink(learnMoreLink);
  };

  const clearStatusBanner = () => {
    setAcrStatusMessage(undefined);
    setAcrStatusMessageType(undefined);
    setLearnMoreLink(undefined);
  };

  useEffect(() => {
    if (deploymentCenterContext.siteDescriptor && deploymentCenterContext.applicationSettings) {
      fetchData();
    }
  }, [deploymentCenterContext.siteDescriptor, deploymentCenterContext.applicationSettings]);

  useEffect(() => {
    fetchRegistries();
  }, [subscription]);

  useEffect(() => {
    if (registryIdentifiers.current[formProps.values.acrLoginServer]) {
      if (!acrUseManagedIdentities) {
        fetchRepositories(formProps.values.acrLoginServer, true);
      } else {
        setAcrResourceId(formProps.values.acrLoginServer);
      }
    }
  }, [formProps.values.acrLoginServer, acrUseManagedIdentities]);

  useEffect(() => {
    if (registryIdentifiers.current[formProps.values.acrLoginServer] && formProps.values.acrImage && !acrUseManagedIdentities) {
      fetchTags(formProps.values.acrImage, true);
    }
  }, [formProps.values.acrImage]);

  useEffect(() => {
    setAcrUseManagedIdentities(formProps.values.acrCredentialType === ACRCredentialType.managedIdentity);
    if (formProps.values.acrCredentialType === ACRCredentialType.managedIdentity) {
      clearStatusBanner();
      fetchManagedIdentityOptions();
    }
  }, [formProps.values.acrCredentialType]);

  useEffect(() => {
    setManagedIdentityPrincipalId(formProps.values.acrManagedIdentityClientId);
  }, [formProps.values.acrManagedIdentityClientId, managedIdentityInfo.current[formProps.values.acrManagedIdentityClientId]]);

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
      isVnetConfigured={isVnetConfigured}
      legacyVnetAppSetting={legacyVnetAppSetting}
      defaultVnetImagePullSetting={defaultVnetImagePullSetting}
    />
  );
};

export default DeploymentCenterContainerAcrDataLoader;
