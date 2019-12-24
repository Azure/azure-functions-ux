import { Injectable } from '@nestjs/common';
import { FunctionAppCreateRuntimeStack } from './stacks';

@Injectable()
export class StacksFunctionAppCreateService {
  getStacks(): FunctionAppCreateRuntimeStack[] {
    const stacks = [this._netCoreStacks, this._nodeStacks, this._pythonStacks, this._java8Stacks, this._powershellStacks];

    return stacks;
  }

  private _nodeStacks: FunctionAppCreateRuntimeStack = {};

  private _pythonStacks: FunctionAppCreateRuntimeStack = {};

  private _netCoreStacks: FunctionAppCreateRuntimeStack = {};

  private _java8Stacks: FunctionAppCreateRuntimeStack = {};

  private _powershellStacks: FunctionAppCreateRuntimeStack = {};
}
