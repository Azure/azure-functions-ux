import { Application } from 'express';
import { setupGithubAuthentication, getGithubTokens } from './githubAuth';
import { setupBitbucketAuthentication, getBitbucketTokens } from './bitbucketAuth';
import { setupOnedriveAuthentication, getOnedriveTokens } from './onedriveAuth';
import { setupDropboxAuthentication } from './dropboxAuth';

export function setupDeploymentCenter(app: Application) {
    app.get('/api/SourceControlAuthenticationState', async (req, res) => {
        const result = await Promise.all([getBitbucketTokens(req), getGithubTokens(req), getOnedriveTokens(req)]);
        console.log(result);
        res.send({ github: result[1].authenticated, onedrive: result[2].authenticated, bitbucket: result[0].authenticated });
    });

    setupGithubAuthentication(app);
    setupBitbucketAuthentication(app);
    setupOnedriveAuthentication(app);
    setupDropboxAuthentication(app);
}
