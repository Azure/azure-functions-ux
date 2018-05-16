import { Application } from 'express';
import axios from 'axios';
import { oAuthHelper } from './oauth-helper';
import { constants } from '../constants';
import { GUID } from '../utilities/guid';
import { LogHelper } from '../logHelper';
import { ApiRequest, PassthroughRequestBody } from '../types/request';
const oauthHelper: oAuthHelper = new oAuthHelper('bitbucket');
export async function getBitbucketTokens(req: any): Promise<any> {
    return await oauthHelper.getToken(req.body.authToken);
}
export function setupBitbucketAuthentication(app: Application) {
    app.post('/api/bitbucket/passthrough', async (req: ApiRequest<PassthroughRequestBody>, res) => {
        const tokenData = await getBitbucketTokens(req);

        if (!tokenData.authenticated) {
            LogHelper.warn('bitbucket-passthrough-unauthorized', {});
            res.sendStatus(401);
        }
        try {
            const response = await axios.get(req.body.url, {
                headers: {
                    Authorization: `Bearer ${tokenData.token}`
                }
            });
            res.json(response.data);
        } catch (err) {
            LogHelper.error('bitbucket-passthrough', err);
            res.send(err.response); //most likely due to expired creds
        }
    });

    app.get('/auth/bitbucket/authorize', (req, res) => {
        let stateKey = '';
        if (req && req.session) {
            stateKey = req.session[constants.oauthApis.bitbucket_state_key] = GUID.newGuid();
        } else {
            LogHelper.error('session-not-found', {});
            res.sendStatus(500);
            return;
        }
        res.redirect(
            `${constants.oauthApis.bitbucketUri}/authorize?client_id=${process.env.BITBUCKET_CLIENT_ID}&redirect_uri=${process.env
                .BITBUCKET_REDIRECT_URL}&scope=account+repository+webhook&response_type=code&state=${oauthHelper.hashStateGuid(stateKey).substr(0, 10)}`
        );
    });

    app.get('/auth/bitbucket/callback', (_, res) => {
        res.sendStatus(200);
    });

    app.post('/auth/bitbucket/storeToken', async (req, res) => {
        const hostUrl = req.headers.origin as string;
        const environment = oauthHelper.getEnvironment(hostUrl);
        if(!environment){
            res.sendStatus(403);
            return;
        }
        const code = oauthHelper.getParameterByName('code', req.body.redirUrl);
        const state = oauthHelper.getParameterByName('state', req.body.redirUrl);
        if (!req || !req.session || !req.session[constants.oauthApis.bitbucket_state_key] || oauthHelper.hashStateGuid(req.session[constants.oauthApis.bitbucket_state_key]).substr(0, 10) !== state) {
            LogHelper.error('bitbucket-invalid-sate-key', {});
            res.sendStatus(403);
            return;
        }
        try {
            const r = await axios.post(
                `${constants.oauthApis.bitbucketUri}/access_token`,
                `code=${code}&grant_type=authorization_code&redirect_uri=${process.env.BITBUCKET_REDIRECT_URL}`,
                {
                    auth: {
                        username: process.env.BITBUCKET_CLIENT_ID as string,
                        password: process.env.BITBUCKET_CLIENT_SECRET as string
                    },
                    headers: {
                        Referer: process.env.BITBUCKET_REDIRECT_URL,
                        'Content-type': 'application/x-www-form-urlencoded'
                    }
                }
            );
            const token = { access_token: r.data.access_token, refresh_token: r.data.refresh_token };
            oauthHelper.saveToken(token.access_token, req.body.authToken as string, token.refresh_token as string, environment);
            res.sendStatus(200);
        } catch (err) {
            LogHelper.error('bitbucket-token-store', err);
            res.sendStatus(err.response);
        }
    });
}
