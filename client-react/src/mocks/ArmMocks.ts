export const mockSite = {
  id: '/subscriptions/sub/resourceGroups/azure-functions-react-test/providers/Microsoft.Web/sites/azure-functions-react-test',
  name: 'azure-functions-react-test',
  type: 'Microsoft.Web/sites',
  kind: 'app,linux',
  location: 'Central US',
  properties: {
    name: 'azure-functions-react-test',
    state: 'Running',
    hostNames: ['azure-functions-react-test.azurewebsites.net'],
    webSpace: 'azure-functions-react-test-CentralUSwebspace',
    selfLink:
      'https://waws-prod-dm1-027.api.azurewebsites.windows.net:454/subscriptions/sub/webspaces/azure-functions-react-test-CentralUSwebspace/sites/azure-functions-react-test',
    repositorySiteName: 'azure-functions-react-test',
    owner: null,
    usageState: 'Normal',
    enabled: true,
    adminEnabled: true,
    enabledHostNames: ['azure-functions-react-test.azurewebsites.net', 'azure-functions-react-test.scm.azurewebsites.net'],
    siteProperties: {
      metadata: null,
      properties: [
        {
          name: 'LinuxFxVersion',
          value: 'TOMCAT|8.5-jre8',
        },
        {
          name: 'WindowsFxVersion',
          value: null,
        },
      ],
      appSettings: null,
    },
    availabilityState: 'Normal',
    sslCertificates: null,
    csrs: [],
    cers: null,
    siteMode: null,
    hostNameSslStates: [
      {
        name: 'azure-functions-react-test.azurewebsites.net',
        sslState: 'Disabled',
        ipBasedSslResult: null,
        virtualIP: null,
        thumbprint: null,
        toUpdate: null,
        toUpdateIpBasedSsl: null,
        ipBasedSslState: 'NotConfigured',
        hostType: 'Standard',
      },
      {
        name: 'azure-functions-react-test.scm.azurewebsites.net',
        sslState: 'Disabled',
        ipBasedSslResult: null,
        virtualIP: null,
        thumbprint: null,
        toUpdate: null,
        toUpdateIpBasedSsl: null,
        ipBasedSslState: 'NotConfigured',
        hostType: 'Repository',
      },
    ],
    computeMode: null,
    serverFarm: null,
    serverFarmId:
      '/subscriptions/sub/resourceGroups/azure-functions-react-test/providers/Microsoft.Web/serverfarms/ServicePlan9131048f-9b79',
    reserved: false,
    isXenon: false,
    lastModifiedTimeUtc: '2018-10-17T17:34:08.6533333',
    storageRecoveryDefaultState: 'Running',
    contentAvailabilityState: 'Normal',
    runtimeAvailabilityState: 'Normal',
    siteConfig: null,
    deploymentId: 'azure-functions-react-test',
    trafficManagerHostNames: null,
    sku: 'Standard',
    scmSiteAlsoStopped: false,
    targetSwapSlot: null,
    hostingEnvironment: null,
    hostingEnvironmentProfile: null,
    clientAffinityEnabled: true,
    clientCertEnabled: false,
    hostNamesDisabled: false,
    domainVerificationIdentifiers: null,
    kind: 'app',
    outboundIpAddresses: '52.173.249.137,52.176.59.177,52.173.201.190,52.173.203.66,52.173.251.28',
    possibleOutboundIpAddresses: '52.173.249.137,52.176.59.177,52.173.201.190,52.173.203.66,52.173.251.28,52.173.202.202,52.173.200.111',
    containerSize: 0,
    dailyMemoryTimeQuota: 0,
    suspendedTill: null,
    siteDisabledReason: 0,
    functionExecutionUnitsCache: null,
    maxNumberOfWorkers: null,
    homeStamp: 'waws-prod-dm1-027',
    cloningInfo: null,
    hostingEnvironmentid: '',
    tags: null,
    resourceGroup: 'azure-functions-react-test',
    defaultHostName: 'azure-functions-react-test.azurewebsites.net',
    slotSwapStatus: null,
    httpsOnly: false,
  },
};

export const mockAppSettings = {
  id:
    '/subscriptions/sub/resourceGroups/azure-functions-react-test/providers/Microsoft.Web/sites/azure-functions-react-test/config/appsettings',
  name: 'appsettings',
  type: 'Microsoft.Web/sites/config',
  location: 'Central US',
  properties: {
    MSDEPLOY_RENAME_LOCKED_FILES: '1',
    TEST_NAME: 'TEST_VALUE',
  },
};

export const mockWebConfig = {
  id: '/subscriptions/sub/resourceGroups/azure-functions-react-test/providers/Microsoft.Web/sites/azure-functions-react-test/config/web',
  name: 'azure-functions-react-test',
  type: 'Microsoft.Web/sites/config',
  location: 'Central US',
  properties: {
    numberOfWorkers: 1,
    defaultDocuments: [
      'Default.htm',
      'Default.html',
      'Default.asp',
      'index.htm',
      'index.html',
      'iisstart.htm',
      'default.aspx',
      'index.php',
      'hostingstart.html',
    ],
    netFrameworkVersion: 'v4.0',
    phpVersion: '5.6',
    pythonVersion: '',
    nodeVersion: '',
    linuxFxVersion: '',
    windowsFxVersion: null,
    requestTracingEnabled: false,
    remoteDebuggingEnabled: false,
    remoteDebuggingVersion: 'VS2012',
    httpLoggingEnabled: false,
    logsDirectorySizeLimit: 35,
    detailedErrorLoggingEnabled: false,
    publishingUsername: '$azure-functions-react-test',
    publishingPassword: null,
    appSettings: null,
    azureStorageAccounts: {},
    metadata: null,
    connectionStrings: null,
    machineKey: null,
    handlerMappings: [
      {
        extension: 'sdasdasdas',
        scriptProcessor: 'asdasdasda',
        arguments: 'asdasdasd',
      },
    ],
    documentRoot: null,
    scmType: 'VSTSRM',
    use32BitWorkerProcess: true,
    webSocketsEnabled: false,
    alwaysOn: false,
    javaVersion: null,
    javaContainer: null,
    javaContainerVersion: null,
    appCommandLine: '',
    managedPipelineMode: 0,
    virtualApplications: [
      {
        virtualPath: '/',
        physicalPath: 'site\\wwwroot',
        preloadEnabled: true,
        virtualDirectories: null,
      },
      {
        virtualPath: '/testapp',
        physicalPath: 'site\\testapp',
        preloadEnabled: false,
        virtualDirectories: [
          {
            virtualPath: '/test2',
            physicalPath: 'site\\wwwroot\\dir',
          },
        ],
      },
    ],
    winAuthAdminState: 0,
    winAuthTenantState: 0,
    customAppPoolIdentityAdminState: false,
    customAppPoolIdentityTenantState: false,
    runtimeADUser: null,
    runtimeADUserPassword: null,
    loadBalancing: 'LeastRequests',
    routingRules: [],
    experiments: {
      rampUpRules: [],
    },
    limits: null,
    autoHealEnabled: false,
    autoHealRules: null,
    tracingOptions: null,
    vnetName: '',
    siteAuthEnabled: false,
    siteAuthSettings: {
      enabled: null,
      unauthenticatedClientAction: null,
      tokenStoreEnabled: null,
      allowedExternalRedirectUrls: null,
      defaultProvider: null,
      clientid: '',
      clientSecret: null,
      issuer: null,
      allowedAudiences: null,
      additionalLoginParams: null,
      isAadAutoProvisioned: false,
      googleClientid: '',
      googleClientSecret: null,
      googleOAuthScopes: null,
      facebookAppid: '',
      facebookAppSecret: null,
      facebookOAuthScopes: null,
      twitterConsumerKey: null,
      twitterConsumerSecret: null,
      microsoftAccountClientid: '',
      microsoftAccountClientSecret: null,
      microsoftAccountOAuthScopes: null,
    },
    cors: null,
    push: null,
    apiDefinition: null,
    autoSwapSlotName: null,
    localMySqlEnabled: false,
    managedServiceIdentityid: '',
    xManagedServiceIdentityid: '',
    ipSecurityRestrictions: null,
    http20Enabled: false,
    minTlsVersion: '1.2',
    ftpsState: 'AllAllowed',
    reservedInstanceCount: 0,
  },
};

export const mockConnectionStrings = {
  id:
    '/subscriptions/sub/resourceGroups/azure-functions-react-test/providers/Microsoft.Web/sites/azure-functions-react-test/config/connectionstrings',
  name: 'connectionstrings',
  type: 'Microsoft.Web/sites/config',
  location: 'Central US',
  properties: {
    TEST_CONNECTION: {
      value: 'TEST_CONNECTION_VALUE',
      type: 'MySql',
    },
  },
};

export const mockMetadata = {
  id:
    '/subscriptions/sub/resourceGroups/azure-functions-react-test/providers/Microsoft.Web/sites/azure-functions-react-test/config/metadata',
  name: 'metadata',
  type: 'Microsoft.Web/sites/config',
  location: 'Central US',
  properties: {},
};

export const mockSlotConfigName = {
  id: 'test',
  name: 'azure-functions-react-test',
  type: 'Microsoft.Web/sites',
  location: 'Central US',
  properties: {
    connectionStringNames: ['TEST_CONNECTION'],
    appSettingNames: ['TEST_NAME'],
    azureStorageConfigNames: null,
  },
};

export const mockAvailableStacks = {
  value: [
    {
      id: '',
      name: 'aspnet',
      type: 'Microsoft.Web/availableStacks?osTypeSelected=Windows',
      location: 'westus',
      properties: {
        name: 'aspnet',
        display: 'Net Framework Version',
        dependency: null,
        majorVersions: [
          {
            displayVersion: 'v4.7',
            runtimeVersion: 'v4.0',
            isDefault: true,
            minorVersions: [],
          },
          {
            displayVersion: 'v3.5',
            runtimeVersion: 'v2.0',
            isDefault: false,
            minorVersions: [],
          },
        ],
        frameworks: [],
      },
    },
    {
      id: '',
      name: 'node',
      type: 'Microsoft.Web/availableStacks?osTypeSelected=Windows',
      location: 'westus',
      properties: {
        name: 'node',
        display: 'node.js Version',
        dependency: null,
        majorVersions: [
          {
            displayVersion: '0.6',
            runtimeVersion: '0.6',
            isDefault: false,
            minorVersions: [
              {
                displayVersion: '0.6.20',
                runtimeVersion: '0.6.20',
                isDefault: true,
              },
            ],
          },
          {
            displayVersion: '0.8',
            runtimeVersion: '0.8',
            isDefault: false,
            minorVersions: [
              {
                displayVersion: '0.8.2',
                runtimeVersion: '0.8.2',
                isDefault: false,
              },
              {
                displayVersion: '0.8.19',
                runtimeVersion: '0.8.19',
                isDefault: false,
              },
              {
                displayVersion: '0.8.26',
                runtimeVersion: '0.8.26',
                isDefault: false,
              },
              {
                displayVersion: '0.8.27',
                runtimeVersion: '0.8.27',
                isDefault: false,
              },
              {
                displayVersion: '0.8.28',
                runtimeVersion: '0.8.28',
                isDefault: true,
              },
            ],
          },
          {
            displayVersion: '0.10',
            runtimeVersion: '0.10',
            isDefault: false,
            minorVersions: [
              {
                displayVersion: '0.10.5',
                runtimeVersion: '0.10.5',
                isDefault: false,
              },
              {
                displayVersion: '0.10.18',
                runtimeVersion: '0.10.18',
                isDefault: false,
              },
              {
                displayVersion: '0.10.21',
                runtimeVersion: '0.10.21',
                isDefault: false,
              },
              {
                displayVersion: '0.10.24',
                runtimeVersion: '0.10.24',
                isDefault: false,
              },
              {
                displayVersion: '0.10.28',
                runtimeVersion: '0.10.28',
                isDefault: false,
              },
              {
                displayVersion: '0.10.29',
                runtimeVersion: '0.10.29',
                isDefault: false,
              },
              {
                displayVersion: '0.10.31',
                runtimeVersion: '0.10.31',
                isDefault: false,
              },
              {
                displayVersion: '0.10.32',
                runtimeVersion: '0.10.32',
                isDefault: false,
              },
              {
                displayVersion: '0.10.40',
                runtimeVersion: '0.10.40',
                isDefault: false,
              },
              {
                displayVersion: '0.10.5',
                runtimeVersion: '0.10.5',
                isDefault: true,
              },
            ],
          },
          {
            displayVersion: '0.12',
            runtimeVersion: '0.12',
            isDefault: false,
            minorVersions: [
              {
                displayVersion: '0.12.0',
                runtimeVersion: '0.12.0',
                isDefault: false,
              },
              {
                displayVersion: '0.12.2',
                runtimeVersion: '0.12.2',
                isDefault: false,
              },
              {
                displayVersion: '0.12.3',
                runtimeVersion: '0.12.3',
                isDefault: false,
              },
              {
                displayVersion: '0.12.6',
                runtimeVersion: '0.12.6',
                isDefault: true,
              },
            ],
          },
          {
            displayVersion: '4.8',
            runtimeVersion: '4.8',
            isDefault: false,
            minorVersions: [],
          },
          {
            displayVersion: '6.12',
            runtimeVersion: '6.12',
            isDefault: false,
            minorVersions: [],
          },
          {
            displayVersion: '7.10',
            runtimeVersion: '7.10',
            isDefault: false,
            minorVersions: [
              {
                displayVersion: '7.10.1',
                runtimeVersion: '7.10.1',
                isDefault: true,
              },
            ],
          },
          {
            displayVersion: '8.4',
            runtimeVersion: '8.4',
            isDefault: false,
            minorVersions: [],
          },
          {
            displayVersion: '8.5',
            runtimeVersion: '8.5',
            isDefault: false,
            minorVersions: [],
          },
          {
            displayVersion: '8.9',
            runtimeVersion: '8.9',
            isDefault: false,
            minorVersions: [],
          },
          {
            displayVersion: '8.10',
            runtimeVersion: '8.10',
            isDefault: false,
            minorVersions: [],
          },
          {
            displayVersion: '8.11',
            runtimeVersion: '8.11',
            isDefault: true,
            minorVersions: [],
          },
          {
            displayVersion: '10.0',
            runtimeVersion: '10.0',
            isDefault: false,
            minorVersions: [
              {
                displayVersion: '10.0.0',
                runtimeVersion: '10.0.0',
                isDefault: true,
              },
            ],
          },
          {
            displayVersion: '10.6',
            runtimeVersion: '10.6',
            isDefault: false,
            minorVersions: [
              {
                displayVersion: '10.6.0',
                runtimeVersion: '10.6.0',
                isDefault: true,
              },
            ],
          },
        ],
        frameworks: [],
      },
    },
    {
      id: '',
      name: 'php',
      type: 'Microsoft.Web/availableStacks?osTypeSelected=Windows',
      location: 'westus',
      properties: {
        name: 'php',
        display: 'PHP Version',
        dependency: null,
        majorVersions: [
          {
            displayVersion: '5.6',
            runtimeVersion: '5.6',
            isDefault: true,
            minorVersions: [],
          },
          {
            displayVersion: '7.0',
            runtimeVersion: '7.0',
            isDefault: false,
            minorVersions: [],
          },
          {
            displayVersion: '7.1',
            runtimeVersion: '7.1',
            isDefault: false,
            minorVersions: [],
          },
          {
            displayVersion: '7.2',
            runtimeVersion: '7.2',
            isDefault: false,
            minorVersions: [],
          },
        ],
        frameworks: [],
      },
    },
    {
      id: '',
      name: 'python',
      type: 'Microsoft.Web/availableStacks?osTypeSelected=Windows',
      location: 'westus',
      properties: {
        name: 'python',
        display: 'Python Version',
        dependency: null,
        majorVersions: [
          {
            displayVersion: '2.7',
            runtimeVersion: '2.7',
            isDefault: false,
            minorVersions: [
              {
                displayVersion: '2.7',
                runtimeVersion: '2.7.3',
                isDefault: true,
              },
            ],
          },
          {
            displayVersion: '3.4',
            runtimeVersion: '3.4',
            isDefault: false,
            minorVersions: [
              {
                displayVersion: '3.4',
                runtimeVersion: '3.4.0',
                isDefault: true,
              },
            ],
          },
        ],
        frameworks: [],
      },
    },
    {
      id: '',
      name: 'java',
      type: 'Microsoft.Web/availableStacks?osTypeSelected=Windows',
      location: 'westus',
      properties: {
        name: 'java',
        display: 'Java Version',
        dependency: null,
        majorVersions: [
          {
            displayVersion: '1.7',
            runtimeVersion: '1.7',
            isDefault: true,
            minorVersions: [
              {
                displayVersion: '1.7.0_51',
                runtimeVersion: '1.7.0_51',
                isDefault: false,
              },
              {
                displayVersion: '1.7.0_71',
                runtimeVersion: '1.7.0_71',
                isDefault: false,
              },
              {
                displayVersion: '1.7.0_80',
                runtimeVersion: '1.7.0_80',
                isDefault: true,
              },
            ],
          },
          {
            displayVersion: '1.8',
            runtimeVersion: '1.8',
            isDefault: false,
            minorVersions: [
              {
                displayVersion: '1.8.0_25',
                runtimeVersion: '1.8.0_25',
                isDefault: false,
              },
              {
                displayVersion: '1.8.0_60',
                runtimeVersion: '1.8.0_60',
                isDefault: false,
              },
              {
                displayVersion: '1.8.0_73',
                runtimeVersion: '1.8.0_73',
                isDefault: false,
              },
              {
                displayVersion: '1.8.0_111',
                runtimeVersion: '1.8.0_111',
                isDefault: false,
              },
              {
                displayVersion: '1.8.0_172',
                runtimeVersion: '1.8.0_172',
                isDefault: false,
              },
              {
                displayVersion: 'Zulu-1.8.0_92',
                runtimeVersion: '1.8.0_92',
                isDefault: false,
              },
              {
                displayVersion: 'Zulu-1.8.0_102',
                runtimeVersion: '1.8.0_102',
                isDefault: false,
              },
              {
                displayVersion: 'Zulu-1.8.0_144',
                runtimeVersion: '1.8.0_144',
                isDefault: false,
              },
              {
                displayVersion: 'Zulu-1.8.0_172',
                runtimeVersion: '1.8.0_172_ZULU',
                isDefault: true,
              },
            ],
          },
        ],
        frameworks: [],
      },
    },
    {
      id: '',
      name: 'javaContainers',
      type: 'Microsoft.Web/availableStacks?osTypeSelected=Windows',
      location: 'westus',
      properties: {
        name: 'javaContainers',
        display: 'Java Containers',
        dependency: 'java',
        majorVersions: [],
        frameworks: [
          {
            name: 'tomcat',
            display: 'Tomcat',
            dependency: null,
            majorVersions: [
              {
                displayVersion: '7.0',
                runtimeVersion: '7.0',
                isDefault: false,
                minorVersions: [
                  {
                    displayVersion: '7.0.50',
                    runtimeVersion: '7.0.50',
                    isDefault: false,
                  },
                  {
                    displayVersion: '7.0.62',
                    runtimeVersion: '7.0.62',
                    isDefault: false,
                  },
                  {
                    displayVersion: '7.0.81',
                    runtimeVersion: '7.0.81',
                    isDefault: true,
                  },
                ],
              },
              {
                displayVersion: '8.0',
                runtimeVersion: '8.0',
                isDefault: false,
                minorVersions: [
                  {
                    displayVersion: '8.0.23',
                    runtimeVersion: '8.0.23',
                    isDefault: false,
                  },
                  {
                    displayVersion: '8.0.46',
                    runtimeVersion: '8.0.46',
                    isDefault: true,
                  },
                ],
              },
              {
                displayVersion: '8.5',
                runtimeVersion: '8.5',
                isDefault: false,
                minorVersions: [
                  {
                    displayVersion: '8.5.6',
                    runtimeVersion: '8.5.6',
                    isDefault: false,
                  },
                  {
                    displayVersion: '8.5.20',
                    runtimeVersion: '8.5.20',
                    isDefault: false,
                  },
                  {
                    displayVersion: '8.5.31',
                    runtimeVersion: '8.5.31',
                    isDefault: true,
                  },
                ],
              },
              {
                displayVersion: '9.0',
                runtimeVersion: '9.0',
                isDefault: true,
                minorVersions: [
                  {
                    displayVersion: '9.0.0',
                    runtimeVersion: '9.0.0',
                    isDefault: false,
                  },
                  {
                    displayVersion: '9.0.8',
                    runtimeVersion: '9.0.8',
                    isDefault: true,
                  },
                ],
              },
            ],
            frameworks: null,
          },
          {
            name: 'jetty',
            display: 'Jetty',
            dependency: null,
            majorVersions: [
              {
                displayVersion: '9.1',
                runtimeVersion: '9.1',
                isDefault: false,
                minorVersions: [
                  {
                    displayVersion: '9.1.0.v20131115',
                    runtimeVersion: '9.1.0.20131115',
                    isDefault: true,
                  },
                ],
              },
              {
                displayVersion: '9.3',
                runtimeVersion: '9.3',
                isDefault: true,
                minorVersions: [
                  {
                    displayVersion: '9.3.13.v20161014',
                    runtimeVersion: '9.3.13.20161014',
                    isDefault: true,
                  },
                ],
              },
            ],
            frameworks: null,
          },
        ],
      },
    },
  ],
  nextLink: null,
  id: '',
};
