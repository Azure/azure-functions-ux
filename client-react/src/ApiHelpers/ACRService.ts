import MakeArmCall from './ArmHelper';
import { ArmArray, ArmObj } from '../models/arm-obj';
import { ACRRegistry, ACRWebhookPayload, ACRCredential, ACRRepositories, ACRTags } from '../models/acr';
import { CommonConstants, RBACRoleId } from '../utils/CommonConstants';
import { HttpResponseObject } from '../ArmHelper.types';
import { Method } from 'axios';
import { ACRManagedIdentityType, RoleAssignment } from '../pages/app/deployment-center/DeploymentCenter.types';
import { KeyValue } from '../models/portal-models';
import PortalCommunicator from '../portal-communicator';
import { NetAjaxSettings } from '../models/ajax-request-model';
import { isPortalCommunicationStatusSuccess } from '../utils/portal-utils';
import { Guid } from '../utils/Guid';

export default class ACRService {
  public static getRegistries(subscriptionId: string) {
    return MakeArmCall<ArmArray<ACRRegistry>>({
      resourceId: `/subscriptions/${subscriptionId}/providers/Microsoft.ContainerRegistry/registries`,
      commandName: 'getRegistries',
      method: 'GET',
      apiVersion: CommonConstants.ApiVersions.acrApiVersion20190501,
    });
  }

  public static listCredentials(resourceId: string) {
    return MakeArmCall<ACRCredential>({
      resourceId: `${resourceId}/listCredentials`,
      commandName: 'getCredentials',
      method: 'POST',
      apiVersion: CommonConstants.ApiVersions.acrApiVersion20190501,
    });
  }

  public static updateAcrWebhook(resourceId: string, name: string, location: string, properties: ACRWebhookPayload) {
    const body = {
      name,
      location,
      properties,
      id: '',
    };

    return MakeArmCall<ArmObj<ACRWebhookPayload>>({
      resourceId,
      body,
      commandName: 'updateAcrWebhook',
      method: 'PUT',
      apiVersion: CommonConstants.ApiVersions.acrApiVersion20190501,
    });
  }

  public static deleteAcrWebhook(resourceId: string) {
    return MakeArmCall<void>({
      resourceId,
      commandName: 'deleteAcrWebhook',
      method: 'DELETE',
      apiVersion: CommonConstants.ApiVersions.acrApiVersion20190501,
    });
  }

  public static getRepositories(
    portalContext: PortalCommunicator,
    loginServer: string,
    username: string,
    password: string,
    logger?: (page, error) => void
  ) {
    const encodedUserInfo = btoa(`${username}:${password}`);
    const data = {
      loginServer,
      encodedUserInfo,
    };
    const url = `https://${loginServer}/v2/_catalog`;
    const headers = this._getBasicACRAuthHeader(encodedUserInfo);
    return ACRService._dispatchSpecificPageableRequest<ACRRepositories>(portalContext, data, url, 'GET', headers, logger);
  }

  public static getTags(
    portalCommunicator: PortalCommunicator,
    loginServer: string,
    repository: string,
    username: string,
    password: string,
    logger?: (page, error) => void
  ) {
    const encodedUserInfo = btoa(`${username}:${password}`);
    const data = {
      loginServer,
      repository,
      encodedUserInfo,
    };

    const url = `https://${loginServer}/v2/${repository}/tags/list`;
    const headers = this._getBasicACRAuthHeader(encodedUserInfo);
    return ACRService._dispatchSpecificPageableRequest<ACRTags>(portalCommunicator, data, url, 'GET', headers, logger);
  }

  public static async hasAcrPullPermission(acrResourceId: string, principalId: string) {
    let hasAcrPullPermission = false;
    const roleAssignments = await this.getRoleAssignments(acrResourceId, principalId);
    if (!!roleAssignments && roleAssignments.data.value.length > 0) {
      roleAssignments.data.value.forEach(roleAssignment => {
        const roleDefinitionSplit = roleAssignment.properties.roleDefinitionId.split(CommonConstants.singleForwardSlash);
        const roleId = roleDefinitionSplit[roleDefinitionSplit.length - 1];
        if (roleId === RBACRoleId.acrPull) {
          hasAcrPullPermission = true;
        }
      });
    }

    return hasAcrPullPermission;
  }

  public static async getRoleAssignments(
    scope: string,
    principalId: string,
    apiVersion: string = CommonConstants.ApiVersions.roleAssignmentApiVersion20180701
  ) {
    const urlString = `${scope}/providers/Microsoft.Authorization/roleAssignments?`;
    const queryString = `$filter=atScope()+and+assignedTo('{${principalId}}')`;
    const url = urlString + queryString;

    const response = await MakeArmCall<ArmArray<RoleAssignment>>({
      resourceId: url,
      commandName: 'getRoleAssignments',
      apiVersion: apiVersion,
    });

    if (response.metadata.success && !!response.data) {
      return response;
    }
  }

  public static async setAcrPullPermission(
    acrResourceId: string,
    principalId: string,
    apiVersion: string = CommonConstants.ApiVersions.roleAssignmentApiVersion20180701
  ) {
    const roleId = RBACRoleId.acrPull;
    const roleGuid = Guid.newGuid();

    const urlString = `${acrResourceId}/providers/Microsoft.Authorization/roleAssignments/${roleGuid}?`;
    const queryString = `&$filter=atScope()+and+assignedTo('{${principalId}}')`;
    const url = urlString + queryString;

    const body = {
      properties: {
        roleDefinitionId: `${acrResourceId}/providers/Microsoft.Authorization/roleDefinitions/${roleId}`,
        principalId: `${principalId}`,
      },
    };

    const response = await MakeArmCall({
      body,
      resourceId: url,
      commandName: 'setAcrPullPermissions',
      apiVersion: apiVersion,
      method: 'PUT',
    });

    return !!response;
  }

  public static async enableSystemAssignedIdentity(
    resourceId: string,
    userAssignedIdentities?: KeyValue<KeyValue<string>>,
    apiVersion: string = CommonConstants.ApiVersions.enableSystemAssignedIdentityApiVersion20210201
  ) {
    return MakeArmCall({
      resourceId: resourceId,
      commandName: 'enableSystemAssignedIdentity',
      method: 'PATCH',
      apiVersion: apiVersion,
      body: {
        identity: this._getIdentity(userAssignedIdentities),
      },
    });
  }

  private static _getIdentity(userAssignedIdentities?: KeyValue<KeyValue<string>>) {
    if (userAssignedIdentities) {
      const userAssignedIdentitiesObj = {};
      for (const identity in userAssignedIdentities) {
        userAssignedIdentitiesObj[identity] = {};
      }
      return {
        type: ACRManagedIdentityType.systemAssigned + ', ' + ACRManagedIdentityType.userAssigned,
        userAssignedIdentities: userAssignedIdentitiesObj,
      };
    } else {
      return {
        type: ACRManagedIdentityType.systemAssigned,
      };
    }
  }

  // Sends http requests directly to the ACR (no ARM api) via portal.azure.com
  private static async _dispatchSpecificPageableRequest<T>(
    portalContext: PortalCommunicator,
    data: any,
    url: string,
    method: Method,
    headers?: any,
    logger?: (page, error) => void
  ): Promise<T> {
    let acrObject: T = {} as T;
    const pageResponse = await this._sendSpecificACRRequest<T>(portalContext, data, url, method, headers);
    if (isPortalCommunicationStatusSuccess(pageResponse.status)) {
      acrObject = pageResponse.result.content;
    } else if (logger) {
      logger(pageResponse.result, pageResponse);
    }

    return acrObject;
  }

  private static _sendSpecificACRRequest = async <T>(
    portalContext: PortalCommunicator,
    data: any,
    url: string,
    method: Method,
    headers: any
  ) => {
    const request: NetAjaxSettings = {
      data,
      uri: url,
      type: method,
      headers: { ...headers },
    };

    return await portalContext.makeHttpRequestsViaPortal(request);
  };

  private static _getBasicACRAuthHeader(encodedUserInfo: string) {
    return {
      Authorization: `Basic ${encodedUserInfo}`,
    };
  }

  public static _getNextLink(loginServer: string, response: HttpResponseObject<unknown>): string {
    if (response && response.metadata.success) {
      const linkHeader = response.metadata.headers['link'];
      const links = ACRService._getLinksFromLinkHeader(linkHeader);
      if (links && links.next) {
        return `https://${loginServer}${links.next}`;
      }
    }

    return '';
  }

  // For certain APIs (github, docker, and ACR) the next link is part of the response header
  // in "link" property. This property contains an array of links along with their link relation (rel=)
  // the links could be 'next', 'last', etc.
  public static _getLinksFromLinkHeader(linkHeader: string): { [key: string]: string } {
    const links: { [key: string]: string } = {};

    if (linkHeader) {
      const section = linkHeader.split(';');
      const url = section[0].replace(/<(.*)>/, '$1').trim();
      const name = section[1].replace(/rel="(.*)"/, '$1').trim();
      links[name] = url;
    }

    return links;
  }
}
