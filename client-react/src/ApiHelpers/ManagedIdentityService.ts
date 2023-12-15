import { ArmArray, ArmObj } from '../models/arm-obj';
import { FederatedCredential, UserAssignedIdentity } from '../pages/app/deployment-center/DeploymentCenter.types';
import { CommonConstants } from '../utils/CommonConstants';
import MakeArmCall from './ArmHelper';

export default class ManagedIdentityService {
  public static getUserAssignedIdentity = (
    resourceId: string,
    apiVersion = CommonConstants.ApiVersions.managedIdentityApiVersion20230131
  ) => {
    return MakeArmCall<ArmObj<UserAssignedIdentity>>({
      method: 'GET',
      resourceId: resourceId,
      commandName: 'getUserAssignedIdentityInfo',
      apiVersion,
    });
  };

  public static listUserAssignedIdentitiesBySubscription = (
    subscriptionId: string,
    apiVersion = CommonConstants.ApiVersions.managedIdentityApiVersion20230131
  ) => {
    const resourceId = `/subscriptions/${subscriptionId}/providers/Microsoft.ManagedIdentity/userAssignedIdentities`;
    return MakeArmCall<ArmArray<UserAssignedIdentity>>({
      method: 'GET',
      resourceId,
      commandName: 'getUserAssignedIdentitiesBySubscription',
      apiVersion,
    });
  };

  public static createUserAssignedIdentity = (
    resourceGroupId: string,
    identityName: string,
    location: string,
    apiVersion = CommonConstants.ApiVersions.managedIdentityApiVersion20230131
  ) => {
    const resourceId = `${resourceGroupId}/providers/Microsoft.ManagedIdentity/userAssignedIdentities/${identityName}`;
    const body = {
      location,
    };

    return MakeArmCall<ArmObj<UserAssignedIdentity>, { location: string }>({
      method: 'PUT',
      resourceId: resourceId,
      commandName: 'createUserAssignedIdentity',
      body: body,
      apiVersion,
    });
  };

  public static readonly OIDCFederatedCredentials = {
    issuer: 'https://token.actions.githubusercontent.com',
    audiences: ['api://AzureADTokenExchange'],
  };

  public static async putFederatedCredential(
    managedIdentityResourceId: string,
    credentialName: string,
    subject: string,
    apiVersion = CommonConstants.ApiVersions.managedIdentityApiVersion20230131
  ) {
    const federatedCredentialResourceId = `${managedIdentityResourceId}/federatedIdentityCredentials/${credentialName}`;
    const body = {
      properties: {
        issuer: this.OIDCFederatedCredentials.issuer,
        subject: subject,
        audiences: this.OIDCFederatedCredentials.audiences,
      },
    };

    return MakeArmCall({
      method: 'PUT',
      resourceId: federatedCredentialResourceId,
      body: body,
      commandName: 'putFederatedCredential',
      apiVersion,
    });
  }

  public static async listFederatedCredentials(
    managedIdentityResourceId: string,
    apiVersion = CommonConstants.ApiVersions.managedIdentityApiVersion20230131
  ) {
    return MakeArmCall<ArmArray<FederatedCredential>>({
      method: 'GET',
      resourceId: `${managedIdentityResourceId}/federatedIdentityCredentials`,
      commandName: 'listFederatedCredentials',
      apiVersion,
    });
  }

  public static issuerSubjectAlreadyExists(subject: string, federatedCredentials: ArmObj<FederatedCredential>[]) {
    return (
      federatedCredentials.findIndex(
        credential => credential.properties.issuer === this.OIDCFederatedCredentials.issuer && credential.properties.subject === subject
      ) !== -1
    );
  }
}
