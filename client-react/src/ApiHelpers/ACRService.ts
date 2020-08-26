import MakeArmCall from './ArmHelper';
import { ArmArray, ArmObj } from '../models/arm-obj';
import { ACRRegistry, ACRWebhookPayload, ACRCredential, ACRRepositories, ACRTags } from '../models/acr';
import { CommonConstants } from '../utils/CommonConstants';
import { HttpResponseObject } from '../ArmHelper.types';
import { sendHttpRequest } from './HttpClient';
import Url from '../utils/url';

export default class ACRService {
  public static getRegistries(subscriptionId: string) {
    return MakeArmCall<ArmArray<ACRRegistry>>({
      resourceId: `/subscriptions/${subscriptionId}/providers/Microsoft.ContainerRegistry/registries`,
      commandName: 'getRegistries',
      method: 'GET',
      apiVersion: CommonConstants.ApiVersions.acrApiVersion,
    });
  }

  public static getCredentials(resourceId: string) {
    return MakeArmCall<ACRCredential>({
      resourceId: `${resourceId}/listCredentials`,
      commandName: 'getCredentials',
      method: 'POST',
      apiVersion: CommonConstants.ApiVersions.acrApiVersion,
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
      apiVersion: CommonConstants.ApiVersions.acrApiVersion,
    });
  }

  public static deleteAcrWebhook(resourceId: string) {
    return MakeArmCall<void>({
      resourceId,
      commandName: 'deleteAcrWebhook',
      method: 'DELETE',
      apiVersion: CommonConstants.ApiVersions.acrApiVersion,
    });
  }

  public static getRepositories(loginServer: string, username: string, password: string, logger?: (page, error) => void) {
    const encoded = btoa(`${username}:${password}`);

    const headers = {
      Authorization: `Basic ${encoded}`,
      'Content-Type': 'application/json',
    };

    const url = `https://${loginServer}/v2/_catalog`;

    return ACRService._dispatchPageableRequest<ACRRepositories>(loginServer, url, headers, logger);
  }

  public static getTags(loginServer: string, repository: string, username: string, password: string, logger?: (page, error) => void) {
    const encoded = btoa(`${username}:${password}`);

    const headers = {
      Authorization: `Basic ${encoded}`,
      'Content-Type': 'application/json',
    };

    const url = `https://${loginServer}/v2/${repository}/tags/list`;

    return this._dispatchPageableRequest<ACRTags>(loginServer, url, headers, logger);
  }

  private static async _dispatchPageableRequest<T>(
    loginServer: string,
    originalUrl: string,
    headers: { [key: string]: string },
    logger?: (page, error) => void
  ): Promise<T[]> {
    const items: T[] = [];
    let nextLink = originalUrl;
    let page = 1;
    do {
      const passThroughUrl = `/api/passthrough?q=${nextLink}`;
      const data = ACRService._generatePassthroughObject(nextLink, headers);

      const response = await sendHttpRequest<T>({
        data,
        url: `${Url.serviceHost}${passThroughUrl}`,
        method: 'POST',
      });

      if (response.metadata.success) {
        nextLink = ACRService._getNextLink(loginServer, response);
        items.push(response.data);
      } else {
        nextLink = '';
        if (logger) {
          logger(page, response.metadata.error);
        }
      }

      page = page + 1;
    } while (nextLink);

    return items;
  }

  private static _generatePassthroughObject(url: string, headers: { [key: string]: string }) {
    return {
      method: 'GET',
      url: url,
      body: null,
      headers: headers,
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
