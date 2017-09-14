import { Application } from 'express';
import axios from 'axios';
import { staticConfig } from '../config';

export async function getOnedriveTokens(req: any): Promise<any> {
    if (req && req.session && req.session['onedriveAccess']) {
        return { authenticated: true };
    }
    try {
        const r = await axios.get(
            `${staticConfig.config.env
                .azureResourceManagerEndpoint}/providers/Microsoft.Web/sourcecontrols/OneDrive?api-version=2016-03-01`,
            {
                headers: {
                    Authorization: req.headers.authorization
                }
            }
        );
        const body = r.data;
        if (req && req.session && body && body.properties && body.properties.token) {
            return { authenticated: true, token: body.properties.token };
        } else {
            return { authenticated: false };
        }
    } catch (_) {
        return { authenticated: false };
    }
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
