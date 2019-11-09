export class CommonConstants {
  public static readonly Links = {
    standaloneCreateLearnMore: 'https://go.microsoft.com/fwlink/?linkid=848756',
    pythonLearnMore: 'https://go.microsoft.com/fwlink/?linkid=852196',
    clientAffinityLearnMore: 'https://go.microsoft.com/fwlink/?linkid=798249',
    FTPAccessLearnMore: 'https://go.microsoft.com/fwlink/?linkid=871316',
    vmSizeLearnMore: 'https://go.microsoft.com/fwlink/?linkid=873022',
    appServicePricing: 'https://go.microsoft.com/fwlink/?linkid=873021',
    funcConnStringsLearnMore: 'https://go.microsoft.com/fwlink/?linkid=875276',
    extensionInstallHelpLink: 'https://go.microsoft.com/fwlink/?linkid=2010300',
    funcStorageLearnMore: 'https://go.microsoft.com/fwlink/?linkid=2010003',
    updateExtensionsLearnMore: 'https://go.microsoft.com/fwlink/?linkid=2013353',
    deploymentSlotsLearnMore: 'https://go.microsoft.com/fwlink/?linkid=2014035',
    communityTemplatesLink: 'https://go.microsoft.com/fwlink/?linkid=2022552',
    linuxContainersLearnMore: 'https://go.microsoft.com/fwlink/?linkid=861969',
    premiumV2NotAvailableLearnMore: 'https://go.microsoft.com/fwlink/?linkid=2009376',
    azureComputeUnitLearnMore: 'https://go.microsoft.com/fwlink/?linkid=2027465',
    pv2UpsellInfoLearnMore: 'https://go.microsoft.com/fwlink/?linkid=2028474',
    ipRestrictionsLearnMore: 'https://go.microsoft.com/fwlink/?linkid=854597',
    appDensityWarningLink: 'https://go.microsoft.com/fwlink/?linkid=2098431',
  };

  public static readonly Kinds = {
    linux: 'linux',
    aseV1: 'ASEV1',
    aseV2: 'ASEV2',
    container: 'container',
    functionApp: 'functionapp',
    botapp: 'botapp',
    elastic: 'elastic', // only applies to server farm
    app: 'app',
    api: 'api',
  };

  public static readonly ApiVersions = {
    antaresApiVersion20181101: '2018-11-01',
    armBatchApi: '2015-11-01',
    armLocksApiVersion: '2015-01-01',
    armRbacApiVersion: '2015-07-01',
    storageApiVersion20180701: '2018-07-01',
    eventHubApiVersion20150801: '2015-08-01',
    iotHubApiVersion20170119: '2017-01-19',
    serviceBusApiVersion20150801: '2015-08-01',
    documentDBApiVersion20150408: '2015-04-08',
  };
  public static readonly NonThemeColors = {
    upsell: '#804998',
    upsellBackground: '#e7ddf2',
    blackText: '#161616', // useful for cases where black text is always wanted like against upsell background
  };

  public static readonly FeatureFlags = {
    AllowFreeLinux: 'allowfreelinux',
    ShowNewFunctionAppSettings: 'showNewFunctionAppSettings',
  };

  public static readonly AppDensityLimit = 8;

  public static readonly Pricing = {
    hoursInAzureMonth: 730,
    secondsInAzureMonth: 2628000,
  };
}
