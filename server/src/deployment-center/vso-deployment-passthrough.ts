import { Application } from 'express-serve-static-core';
import { ApiRequest } from '../types/request';
import { getGithubTokens } from './github-auth';
import axios from 'axios';
import { LogHelper } from '../logHelper';

export function setupVsoPassthroughAuthentication(app: Application) {
  app.post('/api/setupvso', async (req: ApiRequest<any>, res) => {
    const uri = `https://${
      req.query.accountName
    }.portalext.visualstudio.com/_apis/ContinuousDelivery/ProvisioningConfigurations?api-version=3.2-preview.1`;
    const passHeaders = req.headers;
    const body = req.body;

    if (body.source && body.source.repository && body.source.repository.type === 'GitHub') {
      const githubToken = await getGithubTokens(req);
      body.source.repository.authorizationInfo.parameters.AccessToken = githubToken.token;
    }
    delete body.authToken;
    try {
      let headers: { [key: string]: string } = {
        Authorization: passHeaders.vstsauthorization as string,
        'Content-Type': 'application/json',
        accept: 'application/json;api-version=4.1-preview.1',
      };
      if (passHeaders.msapassthrough === 'true') {
        headers['X-VSS-ForceMsaPassThrough'] = 'true';
      }
      const result = await axios.post(uri, body, {
        headers,
      });
      res.status(result.status).send(result.data);
    } catch (err) {
      if (err.response) {
        res.status(err.response.status).send(err.response.data);
      } else {
        res.sendStatus(500);
      }
      LogHelper.error('vso-passthrough', err);
    }
  });
}
