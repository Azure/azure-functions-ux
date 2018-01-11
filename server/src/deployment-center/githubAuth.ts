import { Application } from 'express';
import axios from 'axios';
import { staticConfig } from '../config';
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

function getParameterByName(name: string, url: string) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

export function setupGithubAuthentication(app: Application) {
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
        res.redirect(
            `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env
                .GITHUB_REDIRECT_URL}&scope=admin:repo_hook+repo&response_type=code&state=`
        );
    });

    app.get('/auth/github/callback', (_, res) => {
        res.sendStatus(200);
    });

    app.post('/auth/github/storeToken', async (req, res) => {
        console.log(req.body.redirUrl);
        const code = getParameterByName('code', req.body.redirUrl);
        const r = await axios.post(`https://github.com/login/oauth/access_token`, {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code: code
        });
        const token = getParameterByName('access_token', '?' + r.data);
        console.log(token);
        if (req && req.session) {
            req.session['githubAccess'] = token;
        }
        const c = await axios.put(
            `${staticConfig.config.env.azureResourceManagerEndpoint}/providers/Microsoft.Web/sourcecontrols/GitHub?api-version=2016-03-01`,
            {
                name: 'GitHub',
                properties: {
                    name: 'GitHub',
                    token: token
                }
            },
            {
                headers: {
                    Authorization: req.headers.authorization
                }
            }
        );

        res.send(c.data);
    });
}
