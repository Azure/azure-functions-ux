import axios, { AxiosRequestConfig } from 'axios';
import { Request, Response } from 'express';
import { IncomingMessageHeaders } from 'http';

interface TriggerRequest {
  body: string;
  url: string;
}

export function triggerFunctionAPIM(req: Request, res: Response) {
  if (!process.env.APIMSubscriptionKey) {
    res.status(500).send('APIMSubscriptionKey is not defined');
    return;
  }

  const content = req.body as TriggerRequest;
  const headers: IncomingMessageHeaders = {};
  headers['Content-Type'] = 'application/json';
  headers['Accept'] = 'application/json';
  headers['Cache-Control'] = 'no-cache';
  headers['Ocp-Apim-Subscription-Key'] = process.env.APIMSubscriptionKey;
  headers['Ocp-Apim-Trace'] = 'true';

  const request: AxiosRequestConfig = {
    method: 'POST',
    data: content.body,
    headers: headers,
    url: content.url,
  };

  axios
    .request(request)
    .then(r => res.send(r.data))
    .catch(e => {
      if (e.response && e.response.status) {
        let message = e.message;
        if (e.response.data) {
          message = e.response.data;
        }
        res.status(e.response.status).send(message);
      } else if (e.request) {
        res.status(400).send({
          reason: 'TriggerError',
          error: 'request error',
        });
      } else {
        res.status(e.code).send({
          reason: 'TriggerError',
          error: e.code,
        });
      }
    });
}
