import { Application } from 'express';
//import * as ClientOAuth2 from 'client-oauth2';
import axios from 'axios';
import { staticConfig } from '../config';
// const DropboxAuth = new ClientOAuth2({
//     clientId: 'D5LaGjFUAhCZRmY8yC',
//     clientSecret: '8U8s4VVeUBmYtsPUNpc8DVjAH5G38cyT',
//     accessTokenUri: 'https://Dropbox.org/site/oauth2/access_token',
//     authorizationUri: 'https://Dropbox.org/site/oauth2/authorize',
//     redirectUri: 'https://localhost:44300/auth/Dropbox/callback',
//     scopes: ['account', 'repository', 'webhook'],
//     headers: {
//         Referer: 'https://localhost:44300/'
//     }
// });
export async function getDropboxTokens(req: any): Promise<any> {
    try {
        const r = await axios.get(
            `${staticConfig.config.env.azureResourceManagerEndpoint}/providers/Microsoft.Web/sourcecontrols/Dropbox?api-version=2016-03-01`,
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
export function setupDropboxAuthentication(app: Application) {
    app.post('/api/dropbox/passthrough', async (req, res) => {
        const tokenData = await getDropboxTokens(req);
        if (!tokenData.authenticated) {
            res.sendStatus(401);
        }
        try {
            const response = await axios.post(req.body.url, undefined, {
                headers: {
                    Authorization: `Bearer ${tokenData.token}`,
                   // Accept: 'application/json, text/plain, */*',
                    'Content-Type': ""
                }
            });
            res.json(response.data);
        } catch (err) {
            console.log(err);
            res.sendStatus(401);
        }
    });

    // app.get('/api/auth/Dropbox', (_, res) => {
    //     var uri = DropboxAuth.code.getUri();
    //     res.redirect(uri);
    // });

    // app.post('/api/auth/Dropbox/refresh', (req, res) => {
    //     const auth = 'Basic ' + new Buffer('D5LaGjFUAhCZRmY8yC' + ':' + '8U8s4VVeUBmYtsPUNpc8DVjAH5G38cyT').toString('base64');

    //     request.post(
    //         {
    //             url: 'https://Dropbox.org/site/oauth2/access_token',
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

    // app.get('/api/auth/DropboxToken', (req, res) => {
    //     if (req.session && req.session['DropboxToken']) {
    //         res.send({
    //             accessToken: req.session['DropboxToken'],
    //             refreshToken: req.session['DropboxRefresh']
    //         });
    //     } else {
    //         res.send('error');
    //     }
    // });
    // app.get('/auth/Dropbox/callback', (req, res) => {
    //     DropboxAuth.code.getToken(req.originalUrl).then(user => {
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
    //             req.session['DropboxToken'] = user.accessToken;
    //             req.session['DropboxRefresh'] = user.refreshToken;
    //         }
    //         res.send(`<script>
    //                     window.close();
    //                 </script>`);
    //     });
    // });

    app.get;
}
