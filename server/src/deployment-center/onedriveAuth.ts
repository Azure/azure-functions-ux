import { Application } from 'express';
import axios from 'axios';
import { oAuthHelper } from './oAuthHelper';

const oauthHelper: oAuthHelper = new oAuthHelper('onedrive');
export async function getOnedriveTokens(req: any): Promise<any> {
    return await oauthHelper.getToken(req.headers.authorization);
}
export function setupOnedriveAuthentication(app: Application) {
    app.post('/api/onedrive/passthrough', async (req, res) => {
        const tokenData = await getOnedriveTokens(req);
        if (!tokenData.authenticated) {
            res.sendStatus(401);
        }
        const response = await axios.get(req.body.url, {
            headers: {
                Authorization: `Bearer ${tokenData.token}`
            }
        });
        res.json(response.data);
    });
}
