import { Application } from 'express';
import * as ClientOAuth2 from 'client-oauth2';
import * as request from 'request';
const bitbucketAuth = new ClientOAuth2({
    clientId: 'D5LaGjFUAhCZRmY8yC',
    clientSecret: '8U8s4VVeUBmYtsPUNpc8DVjAH5G38cyT',
    accessTokenUri: 'https://bitbucket.org/site/oauth2/access_token',
    authorizationUri: 'https://bitbucket.org/site/oauth2/authorize',
    redirectUri: 'https://localhost:44300/auth/bitbucket/callback',
    scopes: ['account', 'repository', 'webhook'],
    headers: {
        Referer: 'https://localhost:44300/'
    }
});
export function setupBitbucketAuthentication(app: Application) {
    app.get('/api/auth/bitbucket', (_, res) => {
        var uri = bitbucketAuth.code.getUri();
        res.redirect(uri);
    });

    app.post('/api/auth/bitbucket/refresh', (req, res) => {
        const auth =
            'Basic ' +
            new Buffer(
                'D5LaGjFUAhCZRmY8yC' + ':' + '8U8s4VVeUBmYtsPUNpc8DVjAH5G38cyT'
            ).toString('base64');

        request.post(
            {
                url: 'https://bitbucket.org/site/oauth2/access_token',
                form: {
                    grant_type: 'refresh_token',
                    refresh_token: req.body.refresh_token
                },
                headers: {
                    Authorization: auth
                }
            },
            (_, __, body) => {
                res.send(JSON.parse(body).access_token);
            }
        );
    });

    app.get('/api/auth/bitbucketToken', (req, res) => {
        if (req.session && req.session['bitbucketToken']) {
            res.send({
                accessToken: req.session['bitbucketToken'],
                refreshToken: req.session['bitbucketRefresh']
            });
        } else {
            res.send('error');
        }
    });
    app.get('/auth/bitbucket/callback', (req, res) => {
        bitbucketAuth.code.getToken(req.originalUrl).then(user => {
            console.log(user);
            user.refresh().then(updatedUser => {
                console.log(updatedUser !== user); //=> true
                console.log(updatedUser.accessToken);
            });

            user.sign({
                method: 'get',
                url: 'https://localhost:44300'
            });
            if (req.session) {
                req.session['bitbucketToken'] = user.accessToken;
                req.session['bitbucketRefresh'] = user.refreshToken;
            }
            res.send(`<script>
                        window.close();
                    </script>`);
        });
    });

    app.get;
}
