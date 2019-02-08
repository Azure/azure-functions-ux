import { Application } from 'express';
import axios from 'axios';
import { oAuthHelper } from './oauth-helper';
import { constants } from '../constants';
import { GUID } from '../utilities/guid';
import { LogHelper } from '../logHelper';
import { ApiRequest, PassthroughRequestBody } from '../types/request';
const oauthHelper: oAuthHelper = new oAuthHelper('github');
export async function getGithubTokens(req: any): Promise<any> {
  return await oauthHelper.getToken(req.body.authToken);
}

export function setupGithubAuthentication(app: Application) {
  app.post('/api/github/passthrough', async (req: ApiRequest<PassthroughRequestBody>, res) => {
    const tokenData = await getGithubTokens(req);
    if (!tokenData.authenticated) {
      LogHelper.warn('github-passthrough-unauthorized', {});
      res.sendStatus(401);
      return;
    }
    try {
      const response = await axios.get(req.body.url, {
        headers: {
          Authorization: `Bearer ${tokenData.token}`,
        },
      });
      if (response.headers.link) {
        res.setHeader('link', response.headers.link);
      }
      res.json(response.data);
    } catch (err) {
      LogHelper.error('github-passthrough', err);
      res.sendStatus(err.response.status);
    }
  });

  app.get('/auth/github/authorize', (req, res) => {
    let stateKey = '';
    if (req && req.session) {
      stateKey = req.session[constants.oauthApis.github_state_key] = GUID.newGuid();
    } else {
      //Should be impossible to hit this
      LogHelper.error('session-not-found', {});
      res.sendStatus(500);
      return;
    }

    res.redirect(
      `${constants.oauthApis.githubApiUri}/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${
        process.env.GITHUB_REDIRECT_URL
      }&scope=admin:repo_hook+repo&response_type=code&state=${oauthHelper.hashStateGuid(stateKey)}`
    );
  });

  app.get('/auth/github/callback', (_, res) => {
    res.sendStatus(200);
  });

  app.post('/auth/github/storeToken', async (req, res) => {
    const state = oauthHelper.getParameterByName('state', req.body.redirUrl);
    if (
      !req ||
      !req.session ||
      !req.session[constants.oauthApis.github_state_key] ||
      oauthHelper.hashStateGuid(req.session[constants.oauthApis.github_state_key]) !== state
    ) {
      LogHelper.error('github-invalid-sate-key', {});
      res.sendStatus(403);
      return;
    }
    const code = oauthHelper.getParameterByName('code', req.body.redirUrl);
    try {
      const r = await axios.post(`${constants.oauthApis.githubApiUri}/access_token`, {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
      });
      const token = oauthHelper.getParameterByName('access_token', '?' + r.data);
      oauthHelper.saveToken(token, req.body.authToken as string);
      res.sendStatus(200);
    } catch (err) {
      LogHelper.error('github-token-store', err);
      res.send(err.response);
    }
  });
}
