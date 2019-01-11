import { Request, Response } from 'express';
import Axios from 'axios';
import { LogHelper } from '../logHelper';

interface ACRDirectRequestPayload {
  subId: string;
  endpoint: string;
  username: string;
  password: string;
}

export async function getAcrTags(req: Request, res: Response) {
  const payload = req.body as ACRDirectRequestPayload;

  if (isRequestPayloadValid(payload, res)) {
    const response = await callAcrAPI(payload);
    res.status(response.status);
    res.send(response.data);
  }
}

export async function getAcrRepositories(req: Request, res: Response) {
  const payload = req.body as ACRDirectRequestPayload;

  if (isRequestPayloadValid(payload, res)) {
    const response = await callAcrAPI(payload);
    res.status(response.status);
    res.send(response.data);
  }
}

async function callAcrAPI(payload: ACRDirectRequestPayload) {
  try {
    const headers = getHeaders(payload);

    const response = await Axios.get(payload.endpoint, {
      headers: headers,
    });

    return response;
  } catch (errorResponse) {
    LogHelper.error('error-callAcrApi', errorResponse);
    return errorResponse;
  }
}

function getHeaders(payload: ACRDirectRequestPayload): { [key: string]: string } {
  const headers: { [key: string]: string } = {};
  headers['Content-Type'] = 'application/json';
  headers['Accept'] = 'application/json';
  headers['Cache-Control'] = 'no-cache';

  // This header is required or API returns 401, yes it needs to be this format
  headers['User-Agent'] =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36';

  const encoded = Buffer.from(`${payload.username}:${payload.password}`).toString('base64');
  headers['Authorization'] = `Basic ${encoded}`;

  return headers;
}

function isRequestPayloadValid(payload: ACRDirectRequestPayload, res: Response) {
  if (!payload) {
    res.status(400).send('ACR Payload is not defined.');
    return false;
  }

  if (!payload.subId) {
    res.status(400).send("ACR Payload 'subId' is not defined.");
    return false;
  }

  if (!payload.endpoint) {
    res.status(400).send("ACR Payload 'endpopint' is not defined.");
    return false;
  }

  if (!payload.username) {
    res.status(400).send("ACR Payload 'username' is not defined.");
    return false;
  }

  if (!payload.password) {
    res.status(400).send("ACR Payload 'password' is not defined.");
    return false;
  }

  return true;
}
