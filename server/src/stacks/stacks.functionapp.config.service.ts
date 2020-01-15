import { Injectable } from '@nestjs/common';
import { FunctionAppConfigRuntimeStack } from './stacks';

@Injectable()
export class StacksFunctionAppConfigService {
  getStacks(): FunctionAppConfigRuntimeStack[] {
    const stacks = [this._netCoreStacks, this._nodeStacks, this._pythonStacks, this._java8Stacks, this._powershellStacks];

    return stacks;
  }

  private _nodeStacks: FunctionAppConfigRuntimeStack = {};

  private _pythonStacks: FunctionAppConfigRuntimeStack = {};

  private _netCoreStacks: FunctionAppConfigRuntimeStack = {
    displayText: '.NET Core',
    value: 'dotnetcore',
    sortOrder: 0,
    versions: [
      {
        displayText: '.NET Core',
        value: 'dotnetcore',
        sortOrder: 0,
        supportedPlatforms: [
          {
            os: 'windows',
            isPreview: false,
            runtimeVersion: '2.2',
            applicationInsightSettings: {
              enabled: true,
            },
          },
          {
            os: 'linux',
            isPreview: false,
            runtimeVersion: 'DOCKER|mcr.microsoft.com/azure-functions/dotnet:2.0-appservice',
            applicationInsightSettings: {
              enabled: true,
            },
          },
        ],
      },
    ],
  };

  private _java8Stacks: FunctionAppConfigRuntimeStack = {};

  private _powershellStacks: FunctionAppConfigRuntimeStack = {};
}
