import MakeArmCall from './ArmHelper';
import { ArmArray, ArmObj } from '../models/arm-obj';
import { ACRRegistry, ACRWebhookPayload, ACRCredential, ACRRepositories, ACRTags } from '../models/acr';
import { CommonConstants } from '../utils/CommonConstants';
import { HttpResponseObject } from '../ArmHelper.types';
import { Method } from 'axios';
import PortalCommunicator from '../portal-communicator';
import { NetAjaxSettings } from '../models/ajax-request-model';
import { isPortalCommunicationStatusSuccess } from '../utils/portal-utils';
import { getLastItemFromLinks, getLinksFromLinkHeader } from './HttpClient';

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

  // Sends http requests directly to the ACR (no ARM api) via portal.azure.com
  private static async _dispatchSpecificPageableRequest<T>(
    portalContext: PortalCommunicator,
    data: any,
    url: string,
    method: Method,
    headers?: any,
    logger?: (page, error) => void
  ): Promise<T[]> {
    const acrObjectList: T[] = [];
    let nextLink = '';

    const getNextPageableRequest = (lastLink: string) => `?last=${lastLink}&n=100&orderby=`;
    let pageableRequest = '';
    do {
      nextLink = '';
      const requestUrl = `${url}${pageableRequest}`;
      const pageResponse = await this._sendSpecificACRRequest(portalContext, data, requestUrl, method, headers);
      if (isPortalCommunicationStatusSuccess(pageResponse.status)) {
        acrObjectList.push(pageResponse.result.content);
        const headers: string[] = pageResponse.result?.headers?.split(CommonConstants.newlineRegex) ?? [];
        const linkHeader = headers.find(header => header.startsWith('link'));

        if (linkHeader) {
          const links = getLinksFromLinkHeader(linkHeader);
          const lastItem = getLastItemFromLinks(links);
          data.last = lastItem ?? '';
          nextLink = links?.next ?? '';
          pageableRequest = getNextPageableRequest(lastItem);
        }
      } else if (logger) {
        logger(nextLink, pageResponse);
      }
    } while (nextLink);

    return acrObjectList;
  }

  private static _sendSpecificACRRequest = async (
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
