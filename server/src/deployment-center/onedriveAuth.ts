import { Application } from 'express';
import axios from 'axios';
import { oAuthHelper } from './oAuthHelper';
import { LogHelper } from '../logHelper';
import { ApiRequest, PassthroughRequestBody } from '../types/request';

const oauthHelper: oAuthHelper = new oAuthHelper('onedrive');
export async function getOnedriveTokens(req: any): Promise<any> {
    return await oauthHelper.getToken(req.headers.authorization);
}
export function setupOnedriveAuthentication(app: Application) {
    app.post('/api/onedrive/passthrough', async (req: ApiRequest<PassthroughRequestBody>, res) => {
        const tokenData = await getOnedriveTokens(req);
        if (!tokenData.authenticated) {
            LogHelper.warn('onedrive-passthrough-unauthorized', {});
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
            LogHelper.error('onedrive-passthrough', err);
            res.send(err.response);
        }
    });
}
