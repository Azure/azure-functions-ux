import { Application } from 'express';
import * as ClientOAuth2 from 'client-oauth2';
import axios from 'axios';
import { staticConfig } from '../config';

let githubAuth: any = null;

export async function getGithubTokens(req: any): Promise<any> {
    if (req && req.session && req.session['githubAccess']) {
        return { authenticated: true };
    }
    try {
        const r = await axios.get(
            `${staticConfig.config.env.azureResourceManagerEndpoint}/providers/Microsoft.Web/sourcecontrols/GitHub?api-version=2016-03-01`,
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

export function setupGithubAuthentication(app: Application) {
    githubAuth = new ClientOAuth2({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        accessTokenUri: 'https://github.com/login/oauth/access_token',
        authorizationUri: 'https://github.com/login/oauth/authorize',
        redirectUri: process.env.GITHUB_REDIRECT_URL,
        scopes: ['admin:repo_hook', 'repo']
    });
    app.post('/api/github/passthrough', async (req, res) => {
        const tokenData = await getGithubTokens(req);
        if (!tokenData.authenticated) {
            res.sendStatus(401);
        }

        const response = await axios.get(req.body.url, {
            headers: {
                Authorization: `Bearer ${tokenData.token}`
            }
        });
        res.set(response.headers);
        res.json(response.data);
    });

    app.get('/api/auth/github', (_, res) => {
        var uri = githubAuth.code.getUri();
        res.redirect(uri);
    });
    app.get('/auth/github/callback', (req, res) => {
        githubAuth.code.getToken(req.originalUrl).then((user: any) => {
            console.log(user);
            user.refresh().then((updatedUser: any) => {
                console.log(updatedUser !== user); //=> true
                console.log(updatedUser.accessToken);
            });

            user.sign({
                method: 'get',
                url: 'https://localhost:44300'
            });
            if (req.session) {
                req.session['githubToken'] = user.accessToken;
            }
            res.send(`<script>
                        window.close(); 
                    </script>`);
        });
    });
}
