import { Injectable } from '@nestjs/common';
import { FunctionAppStack } from './stacks';

@Injectable()
export class StacksFunctionAppConfigService {
  private _netCoreStacks: FunctionAppStack = {
    displayText: '.NET Core',
    value: 'dotnetcore',
    sortOrder: 0,
    versions: [
      {
        displayText: '.NET Core 2.2',
        value: 'dotnetcore2.2',
        sortOrder: 0,
        supportedPlatforms: [
          {
            sortOrder: 0,
            os: 'windows',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            runtimeVersion: '2.2',
          },
          {
            sortOrder: 1,
            os: 'linux',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            runtimeVersion: 'DOCKER|mcr.microsoft.com/azure-functions/dotnet:2.0-appservice',
          },
        ],
      },
    ],
  };

  private _nodeStacks: FunctionAppStack = {
    sortOrder: 1,
    displayText: 'Node',
    value: 'node',
    versions: [
      {
        sortOrder: 0,
        displayText: 'Node 10',
        value: 'node10',
        supportedPlatforms: [
          {
            sortOrder: 0,
            os: 'windows',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            runtimeVersion: '10.6.0',
          },
          {
            sortOrder: 1,
            os: 'linux',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            runtimeVersion: 'DOCKER|mcr.microsoft.com/azure-functions/node:2.0-node8-appservice',
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
        displayText: 'Python 3.6',
        value: 'python3.6',
        supportedPlatforms: [
          {
            sortOrder: 0,
            os: 'linux',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            runtimeVersion: 'DOCKER|mcr.microsoft.com/azure-functions/python:2.0-python3.6-appservice',
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
        displayText: 'Java 8',
        value: 'java8',
        supportedPlatforms: [
          {
            sortOrder: 0,
            os: 'windows',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            runtimeVersion: '1.8|Tomcat|9.0',
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
        displayText: 'Powershell 1',
        value: 'powershell1',
        supportedPlatforms: [
          {
            sortOrder: 0,
            os: 'windows',
            isPreview: false,
            isDeprecated: false,
            isHidden: false,
            applicationInsightsEnabled: true,
            runtimeVersion: '1',
          },
        ],
      },
    ],
  };

  getStacks(): FunctionAppStack[] {
    return [this._netCoreStacks, this._nodeStacks, this._pythonStacks, this._java8Stacks, this._powershellStacks];
  }
}
