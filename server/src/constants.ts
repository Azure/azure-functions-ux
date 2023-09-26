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
  };
  static quickstartLanguageMap: { [key: string]: string } = {
    'zh-hans': 'zh-CN',
    'zh-hant': 'zh-TW',
    'en-us': 'en',
    'en-gb': 'en',
  };
  static endpointSuffix = {
    mooncake: 'core.chinacloudapi.cn',
    farifax: 'core.usgovcloudapi.net',
    ussec: 'core.microsoft.scloud',
    usnat: 'core.eaglex.ic.gov',
    public: 'core.windows.net',
  };
}

export class CloudArmEndpoints {
  public static public = 'https://management.azure.com';
  public static fairfax = 'https://management.usgovcloudapi.net';
  public static mooncake = 'https://management.chinacloudapi.cn';
  public static usnat = 'https://management.azure.eaglex.ic.gov';
  public static ussec = 'https://management.azure.microsoft.scloud';
}

export class AcrSuffix {
  public static public = '.azurecr.io';
  public static fairfax = '.azurecr.us';
  public static mooncake = '.azurecr.cn';
  public static usnat = '.azurecr.eaglex.ic.gov';
  public static ussec = '.azurecr.microsoft.scloud';
}
