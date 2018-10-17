export namespace constants {
  export namespace authentication {
    export const redirectUrl = 'https://localhost:44300/manage';
    export const resource = 'https://management.core.windows.net/';
    export const scope = 'user_impersonation openid';
  }
  export const templatesPath = '';
  export const AntaresApiVersion = '2016-03-01';
  export const AntaresAppSettingsApiVersion = '2015-08-01';
  export const KeyvaultApiVersion = '2016-10-01';
  export const KeyvaultUri = 'https://vault.azure.net';
  export namespace oauthApis {
    export const bitbucketUri = 'https://bitbucket.org/site/oauth2';
    export const githubApiUri = 'https://github.com/login/oauth';

    export const bitbucket_state_key = 'bitbucket_state_key';
    export const github_state_key = 'github_state_key';
    export const onedrive_state_key = 'onedrive_state_key';
    export const dropbox_state_key = 'dropbox_state_key';
  }
}
