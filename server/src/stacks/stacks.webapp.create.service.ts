import { Injectable } from '@nestjs/common';
import { WebAppCreateRuntimeStack } from './stacks';

@Injectable()
export class StacksWebAppCreateService {
  getStacks(): WebAppCreateRuntimeStack[] {
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

  private _aspNetStacks: WebAppCreateRuntimeStack = {};

  private _nodeStacks: WebAppCreateRuntimeStack = {};

  private _pythonStacks: WebAppCreateRuntimeStack = {};

  private _phpStacks: WebAppCreateRuntimeStack = {};

  private _netCoreStacks: WebAppCreateRuntimeStack = {};

  private _rubyStacks: WebAppCreateRuntimeStack = {};

  private _java8Stacks: WebAppCreateRuntimeStack = {};

  private _java11Stacks: WebAppCreateRuntimeStack = {};
}
