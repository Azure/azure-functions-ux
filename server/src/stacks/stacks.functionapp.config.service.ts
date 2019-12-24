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

  private _netCoreStacks: FunctionAppConfigRuntimeStack = {};

  private _java8Stacks: FunctionAppConfigRuntimeStack = {};

  private _powershellStacks: FunctionAppConfigRuntimeStack = {};
}
