import { Application } from 'express';
import axios from 'axios';
import { oAuthHelper } from './oauth-helper';
import { GUID } from '../utilities/guid';
import { LogHelper } from '../logHelper';
import { ApiRequest, PassthroughRequestBody } from '../types/request';
import { constants } from '../constants';

const oauthHelper: oAuthHelper = new oAuthHelper('dropbox');
export async function getDropboxTokens(req: any): Promise<any> {
    return await oauthHelper.getToken(req.body.authToken);
}
export function setupDropboxAuthentication(app: Application) {
    app.post('/api/dropbox/passthrough', async (req: ApiRequest<PassthroughRequestBody>, res) => {
        const tokenData = await getDropboxTokens(req);
        if (!tokenData.authenticated) {
            LogHelper.warn('dropbox-passthrough-unauthorized', {});
            res.sendStatus(401);
            return;
        }
        try {
            const response = await axios.post(req.body.url, req.body.arg, {
                headers: {
                    Authorization: `Bearer ${tokenData.token}`,
                    'Content-Type': req.body.content_type || ''
                }
            });
            res.json(response.data);
        } catch (err) {
            LogHelper.error('dropbox-passthrough', err);
            res.sendStatus(err.response.status);
        }
    });

    app.get('/auth/dropbox/authorize', (req, res) => {
        let stateKey = '';
        if (req && req.session) {
            stateKey = req.session[constants.oauthApis.dropbox_state_key] = GUID.newGuid();
        } else {
            //Should be impossible to hit this
            LogHelper.error('session-not-found', {});
            res.sendStatus(500);
            return;
        }

        res.redirect(
            `https://dropbox.com/oauth2/authorize?client_id=${process.env.DROPBOX_CLIENT_ID}&redirect_uri=${process.env
                .DROPBOX_REDIRECT_URL}&response_type=code&state=${oauthHelper.hashStateGuid(stateKey).substr(0, 10)}`
        );
    });

    app.get('/auth/dropbox/callback', (_, res) => {
        res.sendStatus(200);
    });

    app.post('/auth/dropbox/storeToken', async (req, res) => {
        const code = oauthHelper.getParameterByName('code', req.body.redirUrl);
        const state = oauthHelper.getParameterByName('state', req.body.redirUrl);
        if (!req || !req.session || !req.session[constants.oauthApis.dropbox_state_key] || oauthHelper.hashStateGuid(req.session[constants.oauthApis.dropbox_state_key]).substr(0, 10) !== state) {
            LogHelper.error('dropbox-invalid-sate-key', {});
            res.sendStatus(403);
            return;
        }
        try {
            const r = await axios.post(
                'https://api.dropbox.com/oauth2/token',
                `code=${code}&grant_type=authorization_code&redirect_uri=${process.env.DROPBOX_REDIRECT_URL}&client_id=${process.env.DROPBOX_CLIENT_ID}&client_secret=${process.env
                    .DROPBOX_CLIENT_SECRET}`,
                {
                    headers: {
                        'Content-type': 'application/x-www-form-urlencoded'
                    }
                }
            );
            const token = r.data.access_token as string;
            oauthHelper.saveToken(token, req.body.authToken as string);
            res.sendStatus(200);
        } catch (err) {
            LogHelper.error('dropbox-token-store', err);
            res.send(err.response);
        }
    });
}
