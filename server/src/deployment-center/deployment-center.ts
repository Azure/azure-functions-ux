import axios from 'axios';
import { Application } from 'express';
import { setupGithubAuthentication } from './github-auth';
import { setupBitbucketAuthentication } from './bitbucket-auth';
import { setupOnedriveAuthentication } from './onedrive-auth';
import { setupDropboxAuthentication } from './dropbox-auth';
import { staticConfig } from '../config';
import { constants } from '../constants';
import { LogHelper } from '../logHelper';
import { setupVsoPassthroughAuthentication } from './vso-deployment-passthrough';

export function setupDeploymentCenter(app: Application) {
  app.post('/api/SourceControlAuthenticationState', async (req, res) => {
    try {
      const r = await axios.get(
        `${staticConfig.config.env.azureResourceManagerEndpoint}/providers/Microsoft.Web/sourcecontrols?api-version=${
          constants.AntaresApiVersion
        }`,
        {
          headers: {
            Authorization: req.body.authToken,
          },
        }
      );
      if (r.status !== 200) {
        res.send({
          github: false,
          onedrive: false,
          bitbucket: false,
          dropbox: false,
        });
        return;
      }
      const body = r.data;
      var providers: any[] = body.value;
      const oneDriveObject = providers.find(x => x.name.toLowerCase() === 'onedrive');
      const bitbucketObject = providers.find(x => x.name.toLowerCase() === 'bitbucket');
      const dropboxObject = providers.find(x => x.name.toLowerCase() === 'dropbox');
      const githubObject = providers.find(x => x.name.toLowerCase() === 'github');
      res.send({
        github: !!githubObject && !!githubObject.properties && !!githubObject.properties.token,
        onedrive: !!oneDriveObject && !!oneDriveObject.properties && !!oneDriveObject.properties.token,
        bitbucket: !!bitbucketObject && !!bitbucketObject.properties && !!bitbucketObject.properties.token,
        dropbox: !!dropboxObject && !!dropboxObject.properties && !!dropboxObject.properties.token,
      });
    } catch (err) {
      LogHelper.error('SourceControlAuthenticationState', err);
      res.send({
        github: false,
        onedrive: false,
        bitbucket: false,
        dropbox: false,
      });
    }
  });

  setupGithubAuthentication(app);
  setupBitbucketAuthentication(app);
  setupOnedriveAuthentication(app);
  setupDropboxAuthentication(app);
  setupVsoPassthroughAuthentication(app);
}
