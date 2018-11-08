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
    res.status(result.status).send(result.data);
  } catch (err) {
    res.sendStatus(500);
    LogHelper.error('vso-passthrough', err);
  }
}
