import { Injectable } from '@nestjs/common';
import { FunctionAppStack } from './stacks';

@Injectable()
export class StacksFunctionAppConfigService {
  private _netCoreStacks: FunctionAppStack = {
    displayText: '.NET Core',
    value: 'dotnet',
    sortOrder: 0,
    versions: [
      {
        displayText: '3.1',
        value: '3.1',
        sortOrder: 0,
        isDefault: true,
        supportedPlatforms: [
          {
            sortOrder: 0,
            os: 'linux',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            runtimeVersion: 'dotnet',
            appSettingsDictionary: {
              FUNCTIONS_WORKER_RUNTIME: 'dotnet',
            },
            siteConfigPropertiesDictionary: {
              Use32BitWorkerProcess: false,
            },
          },
          {
            sortOrder: 1,
            os: 'windows',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            runtimeVersion: '2.2',
            appSettingsDictionary: {
              FUNCTIONS_WORKER_RUNTIME: 'dotnet',
            },
            siteConfigPropertiesDictionary: {},
          },
        ],
      },
    ],
  };

  private _nodeStacks: FunctionAppStack = {
    sortOrder: 1,
    displayText: 'Node.js',
    value: 'node',
    versions: [
      {
        sortOrder: 0,
        displayText: '12',
        value: '12',
        isDefault: false,
        supportedPlatforms: [
          {
            sortOrder: 0,
            os: 'linux',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            runtimeVersion: 'Node|12',
            appSettingsDictionary: {
              FUNCTIONS_WORKER_RUNTIME: 'node',
            },
            siteConfigPropertiesDictionary: {
              Use32BitWorkerProcess: false,
              linuxFxVersion: 'Node|12',
            },
          },
          {
            sortOrder: 1,
            os: 'windows',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            runtimeVersion: '~12',
            appSettingsDictionary: {
              FUNCTIONS_WORKER_RUNTIME: 'node',
              WEBSITE_NODE_DEFAULT_VERSION: '~12',
            },
            siteConfigPropertiesDictionary: {},
          },
        ],
      },
      {
        sortOrder: 1,
        displayText: '10',
        value: '10',
        isDefault: false,
        supportedPlatforms: [
          {
            sortOrder: 0,
            os: 'linux',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            runtimeVersion: 'Node|10',
            appSettingsDictionary: {
              FUNCTIONS_WORKER_RUNTIME: 'node',
            },
            siteConfigPropertiesDictionary: {
              Use32BitWorkerProcess: false,
              linuxFxVersion: 'Node|10',
            },
          },
          {
            sortOrder: 1,
            os: 'windows',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            runtimeVersion: '~10',
            appSettingsDictionary: {
              FUNCTIONS_WORKER_RUNTIME: 'node',
              WEBSITE_NODE_DEFAULT_VERSION: '~10',
            },
            siteConfigPropertiesDictionary: {},
          },
        ],
      },
    ],
  };

  private _pythonStacks: FunctionAppStack = {
    sortOrder: 2,
    displayText: 'Python',
    value: 'python',
    versions: [
      {
        sortOrder: 0,
        displayText: '3.6',
        value: '3.6',
        isDefault: false,
        supportedPlatforms: [
          {
            sortOrder: 0,
            os: 'linux',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            runtimeVersion: 'Python|3.6',
            appSettingsDictionary: {
              FUNCTIONS_WORKER_RUNTIME: 'python',
            },
            siteConfigPropertiesDictionary: {
              Use32BitWorkerProcess: false,
              linuxFxVersion: 'Python|3.6',
            },
          },
        ],
      },
      {
        sortOrder: 1,
        displayText: '3.7',
        value: '3.7',
        isDefault: true,
        supportedPlatforms: [
          {
            sortOrder: 0,
            os: 'linux',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            runtimeVersion: 'Python|3.7',
            appSettingsDictionary: {
              FUNCTIONS_WORKER_RUNTIME: 'python',
            },
            siteConfigPropertiesDictionary: {
              Use32BitWorkerProcess: false,
              linuxFxVersion: 'Python|3.7',
            },
          },
        ],
      },
      {
        sortOrder: 2,
        displayText: '3.8',
        value: '3.8',
        isDefault: false,
        supportedPlatforms: [
          {
            sortOrder: 0,
            os: 'linux',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            runtimeVersion: 'Python|3.8',
            appSettingsDictionary: {
              FUNCTIONS_WORKER_RUNTIME: 'python',
            },
            siteConfigPropertiesDictionary: {
              Use32BitWorkerProcess: false,
              linuxFxVersion: 'Python|3.8',
            },
          },
        ],
      },
    ],
  };

  private _java8Stacks: FunctionAppStack = {
    sortOrder: 3,
    displayText: 'Java',
    value: 'java',
    versions: [
      {
        sortOrder: 0,
        displayText: '8',
        value: '8',
        isDefault: true,
        supportedPlatforms: [
          {
            sortOrder: 0,
            os: 'linux',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            runtimeVersion: 'Java|8',
            appSettingsDictionary: {
              FUNCTIONS_WORKER_RUNTIME: 'java',
            },
            siteConfigPropertiesDictionary: {
              Use32BitWorkerProcess: false,
              linuxFxVersion: 'Java|8',
            },
          },
          {
            sortOrder: 1,
            os: 'windows',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            runtimeVersion: '1.8',
            appSettingsDictionary: {
              FUNCTIONS_WORKER_RUNTIME: 'java',
            },
            siteConfigPropertiesDictionary: {},
          },
        ],
      },
    ],
  };

  private _powershellStacks: FunctionAppStack = {
    sortOrder: 4,
    displayText: 'Powershell Core',
    value: 'powershell',
    versions: [
      {
        sortOrder: 0,
        displayText: '6',
        value: '6',
        isDefault: true,
        supportedPlatforms: [
          {
            sortOrder: 0,
            os: 'windows',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            runtimeVersion: '~6',
            appSettingsDictionary: {
              FUNCTIONS_WORKER_RUNTIME: 'powershell',
            },
            siteConfigPropertiesDictionary: {
              PowerShellVersion: '~6',
            },
          },
        ],
      },
    ],
  };

  getStacks(): FunctionAppStack[] {
    return [this._netCoreStacks, this._nodeStacks, this._pythonStacks, this._java8Stacks, this._powershellStacks];
  }
}
