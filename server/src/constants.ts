export class Constants {
  static templatesPath = '';
  static AntaresApiVersion = '2016-03-01';
  static AntaresApiVersion20181101 = '2018-11-01';
  static AntaresAppSettingsApiVersion = '2015-08-01';
  static KeyvaultApiVersion = '2016-10-01';
  static KeyvaultUri = 'https://vault.azure.net';
  static oauthApis = {
    bitbucketUri: 'https://bitbucket.org/site/oauth2',
    githubApiUri: 'https://github.com/login/oauth',
    bitbucket_state_key: 'bitbucket_state_key',
    github_state_key: 'github_state_key',
    onedrive_state_key: 'onedrive_state_key',
    dropbox_state_key: 'dropbox_state_key',
  };
  static quickstartLanguageMap: { [key: string]: string } = {
    'zh-hans': 'zh-CN',
    'zh-hant': 'zh-TW',
    'en-us': 'en',
    'en-gb': 'en',
  };
}
