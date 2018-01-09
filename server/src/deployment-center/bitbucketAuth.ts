import { Application } from 'express';
//import * as ClientOAuth2 from 'client-oauth2';
import axios from 'axios';
import { staticConfig } from '../config';

const bitbucketAuth: any = null;
export async function getBitbucketTokens(req: any): Promise<any> {
    try {
        const r = await axios.get(
            `${staticConfig.config.env
                .azureResourceManagerEndpoint}/providers/Microsoft.Web/sourcecontrols/Bitbucket?api-version=2016-03-01`,
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
export function setupBitbucketAuthentication(app: Application) {
    // bitbucketAuth = new ClientOAuth2({
    //     clientId: process.env.BITBUCKET_CLIENT_ID,
    //     clientSecret: process.env.BITBUCKET_CLIENT_SECRET,
    //     accessTokenUri: 'https://bitbucket.org/site/oauth2/access_token',
    //     authorizationUri: 'https://bitbucket.org/site/oauth2/authorize',
    //     redirectUri: process.env.BITBUCKET_REDIRECT_URL,
    //     scopes: ['account', 'repository', 'webhook'],
    //     headers: {
    //         Referer: process.env.BITBUCKET_REDIRECT_URL as string
    //     }
    // });
    app.post('/api/bitbucket/passthrough', async (req, res) => {
        const tokenData = await getBitbucketTokens(req);
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

    app.get('/api/auth/bitbucket', (_, res) => {
        var uri = bitbucketAuth.code.getUri();
        res.redirect(uri);
    });

    // app.post('/api/auth/bitbucket/refresh', async (req, res) => {
    //     const auth = 'Basic ' + new Buffer(process.env.BITBUCKET_CLIENT_ID + ':' + process.env.BITBUCKET_CLIENT_SECRET).toString('base64');
    //     const response = await axios.post(
    //         'https://bitbucket.org/site/oauth2/access_token',
    //         {
    //             grant_type: 'refresh_token',
    //             refresh_token: req.body.refresh_token
    //         },
    //         {
    //             headers: {
    //                 Authorization: auth
    //             }
    //         }
    //     );
    //     res.send(response.data.access_token);
    // });

    // app.get('/auth/bitbucket/callback', (req, res) => {
    //     bitbucketAuth.code.getToken(req.originalUrl).then((user => {
    //         console.log(user);
    //         user.refresh().then(updatedUser => {
    //             console.log(updatedUser !== user); //=> true
    //             console.log(updatedUser.accessToken);
    //         });

    //         user.sign({
    //             method: 'get',
    //             url: 'https://localhost:44300'
    //         });
    //         if (req.session) {
    //             req.session['bitbucketToken'] = user.accessToken;
    //             req.session['bitbucketRefresh'] = user.refreshToken;
    //         }
    //         res.send(`<script>
    //                     window.close();
    //                 </script>`);
    //     });
    //});

    // app.get;
}
