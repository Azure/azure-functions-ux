import { Application } from 'express';
import axios from 'axios';
import { oAuthHelper } from './oauth-helper';
import { LogHelper } from '../logHelper';
import { ApiRequest, PassthroughRequestBody } from '../types/request';
import { GUID } from '../utilities/guid';
import { constants } from '../constants';

const oauthHelper: oAuthHelper = new oAuthHelper('onedrive');
export async function getOnedriveTokens(req: any): Promise<any> {
  return await oauthHelper.getToken(req.body.authToken);
}
export function setupOnedriveAuthentication(app: Application) {
  app.post('/api/onedrive/passthrough', async (req: ApiRequest<PassthroughRequestBody>, res) => {
    const tokenData = await getOnedriveTokens(req);
    if (!tokenData.authenticated) {
      LogHelper.warn('onedrive-passthrough-unauthorized', {});
      res.sendStatus(401);
      return;
    }
    try {
      const response = await axios.get(req.body.url, {
        headers: {
          Authorization: `Bearer ${tokenData.token}`,
        },
      });
      res.json(response.data);
    } catch (err) {
      LogHelper.error('onedrive-passthrough', err);
      res.sendStatus(err.response.status);
    }
  });

  app.get('/auth/onedrive/authorize', (req, res) => {
    let stateKey = '';
    if (req && req.session) {
      stateKey = req.session[constants.oauthApis.onedrive_state_key] = GUID.newGuid();
    } else {
      //Should be impossible to hit this
      LogHelper.error('session-not-found', {});
      res.sendStatus(500);
      return;
    }

    res.redirect(
      `https://login.live.com/oauth20_authorize.srf?client_id=${
        process.env.ONEDRIVE_CLIENT_ID
      }&scope=offline_access,onedrive.appfolder&response_type=code&redirect_uri=${
        process.env.ONEDRIVE_REDIRECT_URL
      }&state=${oauthHelper.hashStateGuid(stateKey).substr(0, 10)}`
    );
  });

  app.get('/auth/onedrive/callback', (_, res) => {
    res.sendStatus(200);
  });

  app.post('/auth/onedrive/storeToken', async (req, res) => {
    const code = oauthHelper.getParameterByName('code', req.body.redirUrl);
    const state = oauthHelper.getParameterByName('state', req.body.redirUrl);
    if (
      !req ||
      !req.session ||
      !req.session[constants.oauthApis.onedrive_state_key] ||
      oauthHelper.hashStateGuid(req.session[constants.oauthApis.onedrive_state_key]).substr(0, 10) !== state
    ) {
      LogHelper.error('onedrive-invalid-sate-key', {});
      res.sendStatus(403);
      return;
    }
    try {
      const r = await axios.post(
        'https://login.live.com/oauth20_token.srf',
        `code=${code}&grant_type=authorization_code&redirect_uri=${process.env.ONEDRIVE_REDIRECT_URL}&client_id=${
          process.env.ONEDRIVE_CLIENT_ID
        }&client_secret=${process.env.ONEDRIVE_CLIENT_SECRET}`,
        {
          headers: {
            'Content-type': 'application/x-www-form-urlencoded',
          },
        }
      );
      const token = r.data.access_token as string;
      const refreshToken = r.data.refresh_token as string;
      await oauthHelper.saveToken(token, req.body.authToken as string, refreshToken);
      res.sendStatus(200);
    } catch (err) {
      LogHelper.error('onedrive-token-store', err);
      res.send(err.response);
    }
  });
}
