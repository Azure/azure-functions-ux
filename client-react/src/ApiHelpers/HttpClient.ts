import { HttpResponseObject } from './../ArmHelper.types';
import axios, { AxiosRequestConfig } from 'axios';
import { Guid } from '../utils/Guid';

const sendAxiosRequest = async <T>(options: AxiosRequestConfig, retry = 0) => {
  const config = {
    ...options,
    validateStatus: () => true, // never throw on an error, we can check the status and handle the error in the UI
  };

  const result = await axios(config);
  if (retry && result.status >= 400) {
    if (result.status === 401) {
      if (window.updateAuthToken) {
        const newToken = await window.updateAuthToken('');
        if (window.appsvc && window.appsvc.env) {
          window.appsvc.env.armToken = newToken;
        } else {
          throw Error('window.appsvc not available');
        }
        return sendAxiosRequest(config, retry - 1);
      }
    } else {
      return sendAxiosRequest(config, retry - 1);
    }
  }
  return result;
};

export const sendHttpRequest = <T>(options: AxiosRequestConfig, retry = 0) => {
  return sendAxiosRequest(options, retry).then(r => {
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

export const getJsonHeaders = (): { [key: string]: string } => {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'x-ms-client-request-id': Guid.newGuid(),
  };
};
