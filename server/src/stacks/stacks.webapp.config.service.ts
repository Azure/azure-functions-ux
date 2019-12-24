import { Injectable } from '@nestjs/common';
import { WebAppConfigRuntimeStack } from './stacks';

@Injectable()
export class StacksWebAppConfigService {
  getStacks(): WebAppConfigRuntimeStack[] {
    const stacks = [
      this._aspNetStacks,
      this._nodeStacks,
      this._pythonStacks,
      this._phpStacks,
      this._netCoreStacks,
      this._rubyStacks,
      this._java8Stacks,
      this._java11Stacks,
    ];

    return stacks;
  }

  private _aspNetStacks: WebAppConfigRuntimeStack = {};

  private _nodeStacks: WebAppConfigRuntimeStack = {};

  private _pythonStacks: WebAppConfigRuntimeStack = {};

  private _phpStacks: WebAppConfigRuntimeStack = {};

  private _netCoreStacks: WebAppConfigRuntimeStack = {};

  private _rubyStacks: WebAppConfigRuntimeStack = {};

  private _java8Stacks: WebAppConfigRuntimeStack = {};

  private _java11Stacks: WebAppConfigRuntimeStack = {};
}
