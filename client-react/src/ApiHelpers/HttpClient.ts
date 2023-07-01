import axios, { AxiosRequestConfig } from 'axios';

import { KeyValue } from '../models/portal-models';
import { Guid } from '../utils/Guid';
import Url from '../utils/url';

import { HttpResponseObject } from './../ArmHelper.types';

export class WellKnownHeaders {
  static readonly REQUEST_ID = 'x-ms-client-request-id';
  static readonly SESSION_ID = 'x-ms-client-session-id';
}

export const sendHttpRequest = <T>(options: AxiosRequestConfig, excludeWellKnownHeaders = false) => {
  options.headers = options.headers ? options.headers : {};

  if (excludeWellKnownHeaders) {
    // NOTE(michinoy): Due to the CORS errors we are seeing when calling bitbucket, onedrive, and dropbox
    // the well known (x-ms-*) headers need to be removed from the request.
    delete options.headers[WellKnownHeaders.SESSION_ID];
    delete options.headers[WellKnownHeaders.REQUEST_ID];
  } else {
    options.headers[WellKnownHeaders.SESSION_ID] = window.appsvc && window.appsvc.sessionId;
    if (!options.headers[WellKnownHeaders.REQUEST_ID]) {
      options.headers[WellKnownHeaders.REQUEST_ID] = Guid.newGuid();
    }
  }

  return axios({
    ...options,
    validateStatus: () => true, // never throw error
  }).then(r => {
    const success = r.status < 400;
    const response: HttpResponseObject<T> = {
      metadata: {
        success,
        status: r.status,
        error: success ? null : r.data,
        headers: r.headers,
      },
      data: r.data,
    };

    return response;
  });
};

export const getJsonHeaders = (): KeyValue<string> => {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'x-ms-client-request-id': Guid.newGuid(),
  };
};

export const getTextHeaders = (): KeyValue<string> => {
  return {
    'Content-Type': 'text/plain',
    Accept: 'text/plain,*/*',
  };
};

export const getLinksFromLinkHeader = (linksHeader: string): { [key: string]: string } => {
  const links: { [key: string]: string } = {};

  if (linksHeader) {
    // Parse each part into a named link
    linksHeader.split(',').forEach(part => {
      const section = part.split(';');
      if (section.length > 1) {
        const url = section[0].replace(/<(.*)>/, '$1').trim();
        const name = section[1].replace(/rel="(.*)"/, '$1').trim();
        links[name] = url;
      }
    });
  }

  return links;
};

export const getLastPageNumberFromLinks = (links: { [key: string]: string }) => {
  const lastPageLink = links && links.last;
  if (lastPageLink) {
    const lastPageNumberString = Url.getParameterByName(lastPageLink, 'page');
    if (lastPageNumberString) {
      return +lastPageNumberString;
    }
  }
  return 1;
};

export const getLastItemFromLinks = (links: { [key: string]: string }) => {
  const nextPageLink = links && links.next;
  if (nextPageLink) {
    const lastItemString = Url.getParameterByName(nextPageLink, 'last');
    if (lastItemString) {
      return lastItemString;
    }
  }
  return '';
};
