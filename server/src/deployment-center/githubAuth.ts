import { Application } from 'express';
import * as ClientOAuth2 from 'client-oauth2';

const githubAuth = new ClientOAuth2({
    clientId: '2b8d950411b4d99e4699',
    clientSecret: '13b3e46940497a8d90119e1b5fb90e7b85d35905',
    accessTokenUri: 'https://github.com/login/oauth/access_token',
    authorizationUri: 'https://github.com/login/oauth/authorize',
    redirectUri: 'https://localhost:44300/auth/github/callback',
    scopes: ['admin:repo_hook', 'repo']
});
export function setupGithubAuthentication(app: Application) {
    app.get('/api/auth/github', (_, res) => {
        var uri = githubAuth.code.getUri();
        res.redirect(uri);
    });

    app.get('/auth/github/callback', (req, res) => {
        githubAuth.code.getToken(req.originalUrl).then(user => {
            console.log(user);
            user.refresh().then(updatedUser => {
                console.log(updatedUser !== user); //=> true
                console.log(updatedUser.accessToken);
            });

            user.sign({
                method: 'get',
                url: 'https://localhost:44300'
            });

            return res.send(user.accessToken);
        });
    });
}
