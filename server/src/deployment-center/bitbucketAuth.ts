import { Application } from 'express';
//import * as ClientOAuth2 from 'client-oauth2';
import axios from 'axios';
import { staticConfig } from '../config';
// const bitbucketAuth = new ClientOAuth2({
//     clientId: 'D5LaGjFUAhCZRmY8yC',
//     clientSecret: '8U8s4VVeUBmYtsPUNpc8DVjAH5G38cyT',
//     accessTokenUri: 'https://bitbucket.org/site/oauth2/access_token',
//     authorizationUri: 'https://bitbucket.org/site/oauth2/authorize',
//     redirectUri: 'https://localhost:44300/auth/bitbucket/callback',
//     scopes: ['account', 'repository', 'webhook'],
//     headers: {
//         Referer: 'https://localhost:44300/'
//     }
// });
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

    // app.get('/api/auth/bitbucket', (_, res) => {
    //     var uri = bitbucketAuth.code.getUri();
    //     res.redirect(uri);
    // });

    // app.post('/api/auth/bitbucket/refresh', (req, res) => {
    //     const auth = 'Basic ' + new Buffer('D5LaGjFUAhCZRmY8yC' + ':' + '8U8s4VVeUBmYtsPUNpc8DVjAH5G38cyT').toString('base64');

    //     request.post(
    //         {
    //             url: 'https://bitbucket.org/site/oauth2/access_token',
    //             form: {
    //                 grant_type: 'refresh_token',
    //                 refresh_token: req.body.refresh_token
    //             },
    //             headers: {
    //                 Authorization: auth
    //             }
    //         },
    //         (_, __, body) => {
    //             res.send(JSON.parse(body).access_token);
    //         }
    //     );
    // });

    // app.get('/api/auth/bitbucketToken', (req, res) => {
    //     if (req.session && req.session['bitbucketToken']) {
    //         res.send({
    //             accessToken: req.session['bitbucketToken'],
    //             refreshToken: req.session['bitbucketRefresh']
    //         });
    //     } else {
    //         res.send('error');
    //     }
    // });
    // app.get('/auth/bitbucket/callback', (req, res) => {
    //     bitbucketAuth.code.getToken(req.originalUrl).then(user => {
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
    // });

    app.get;
}
