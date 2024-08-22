import MakeArmCall from './ArmHelper';
import { ArmArray, ArmObj } from '../models/arm-obj';
import { ACRRegistry, ACRWebhookPayload, ACRCredential, ACRRepositories, ACRTags } from '../models/acr';
import { CommonConstants, RBACRoleId } from '../utils/CommonConstants';
import { HttpResponseObject } from '../ArmHelper.types';
import { getLastItemFromLinks, getLinksFromLinkHeader, sendHttpRequest } from './HttpClient';
import Url from '../utils/url';
import { Method } from 'axios';
import { getArmEndpoint, getArmToken } from '../pages/app/deployment-center/utility/DeploymentCenterUtility';
import { ACRManagedIdentityType, RoleAssignment } from '../pages/app/deployment-center/DeploymentCenter.types';
import { KeyValue } from '../models/portal-models';

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

  public static getRepositories(loginServer: string, username: string, password: string, logger?: (page, error) => void) {
    const encodedUserInfo = btoa(`${username}:${password}`);
    const data = {
      loginServer,
      encodedUserInfo,
    };

    return ACRService._dispatchSpecificPageableRequest<ACRRepositories>(data, 'getRepositories', 'POST', logger);
  }

  public static getTags(loginServer: string, repository: string, username: string, password: string, logger?: (page, error) => void) {
    const encodedUserInfo = btoa(`${username}:${password}`);
    const data = {
      loginServer,
      repository,
      encodedUserInfo,
    };

    return ACRService._dispatchSpecificPageableRequest<ACRTags>(data, 'getTags', 'POST', logger);
  }

  public static async hasAcrPullPermission(acrResourceId: string, principalId: string) {
    let hasAcrPullPermission = false;
    const roleAssignments = await this.getRoleAssignments(acrResourceId, principalId);
    if (!!roleAssignments && roleAssignments.length > 0) {
      roleAssignments.forEach(roleAssignment => {
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
    const armEndpoint = getArmEndpoint();
    const armToken = getArmToken();

    const response = await sendHttpRequest<RoleAssignment[]>({
      data: { armEndpoint, armToken, apiVersion, scope, principalId },
      url: `${Url.serviceHost}api/acr/getRoleAssignments`,
      method: 'POST',
    });

    if (response.metadata.success && !!response.data) {
      return response.data;
    }
  }

  public static async setAcrPullPermission(
    acrResourceId: string,
    principalId: string,
    apiVersion: string = CommonConstants.ApiVersions.roleAssignmentApiVersion20180701
  ) {
    const armEndpoint = getArmEndpoint();
    const armToken = getArmToken();
    const roleId = RBACRoleId.acrPull;

    const response = await sendHttpRequest<RoleAssignment[]>({
      data: { armEndpoint, armToken, apiVersion, scope: acrResourceId, principalId, roleId },
      url: `${Url.serviceHost}api/acr/setRoleAssignment`,
      method: 'POST',
    });

    return response.metadata.success;
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

  private static async _dispatchSpecificPageableRequest<T>(
    data: any,
    apiName: string,
    method: Method,
    logger?: (page, error) => void
  ): Promise<T[]> {
    const acrObjectList: T[] = [];
    let nextLink = '';
    do {
      nextLink = '';
      const pageResponse = await this._sendSpecificACRRequest<T>(data, apiName, method);
      if (pageResponse.metadata.success) {
        acrObjectList.push(pageResponse.data);

        const linkHeader = pageResponse.metadata.headers.link;
        if (linkHeader) {
          const links = getLinksFromLinkHeader(linkHeader);
          const lastItem = getLastItemFromLinks(links);
          data.last = lastItem ?? '';
          nextLink = links?.next ?? '';
        }
      } else if (logger) {
        logger(nextLink, pageResponse);
        break;
      }
    } while (nextLink);

    return acrObjectList;
  }

  private static _sendSpecificACRRequest = <T>(data: any, apiName: string, method: Method) => {
    return sendHttpRequest<T>({
      data,
      url: `${Url.serviceHost}api/acr/${apiName}`,
      method,
    });
  };

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
