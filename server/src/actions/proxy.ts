import axios from 'axios';
import { Request, Response } from 'express';
import { LogHelper } from '../logHelper';

interface ProxyRequest {
  body: string;
  headers: { [name: string]: string };
  method: string;
  url: string;
}

export async function proxy(req: Request, res: Response) {
  const { method, url, headers, body } = req.body as ProxyRequest;

  try {
    const result = await axios({
      method,
      url,
      headers,
      data: body,
    });

    if (result.headers) {
      Object.keys(result.headers).forEach(key => {
        res.setHeader(key, result.headers[key]);
      });
    }

    res.status(result.status).send(result.data);
  } catch (err) {
    if (err.response) {
      res.status(err.response.status).send(err.response.data);
    } else {
      res.sendStatus(500);
    }
    LogHelper.error('proxy-passthrough', err);
  }
}
