import { Application } from 'express';
import axios from 'axios';
import { staticConfig } from '../config';

export async function getOnedriveTokens(req: any): Promise<any> {
    if(req && req.session && req.session['onedriveAccess'])
    {
        return {authenticated: true};
    }
    try{
        const r = await axios.get( `${staticConfig.config.env.azureResourceManagerEndpoint}/providers/Microsoft.Web/sourcecontrols/OneDrive?api-version=2016-03-01`,
            {
                headers: {
                    Authorization: req.headers.authorization
                }
            }
        );
        const body = r.data;
        if (req && req.session && body && body.properties && body.properties.token) {
            const accessData = {
                token: body.properties.token,
                expirationTime: body.properties.expirationTime
            };
            req.session['onedriveAccess'] = accessData;
            return {authenticated: true};
        }
        else{
            return {authenticated: false};
        }

    }
    catch(_)
    {
        return {authenticated: false};
    }
}
export function setupOnedriveAuthentication(app: Application) {

    app.post('/api/onedrive/passthrough', (req, res) => {
        if(!req || !req.session){
            res.status(500).send("no session");
            return;
        }
        axios
            .get(req.body.url, {
                headers: {
                    Authorization: `bearer ${req.session.onedriveAccess.token}`
                }
            })
            .then(r => {
                res.json(r.data);
            })
            .catch(err => {
                console.log(err);
            });
    });

}
