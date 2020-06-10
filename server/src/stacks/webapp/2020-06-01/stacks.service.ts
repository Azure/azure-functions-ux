import { Injectable } from '@nestjs/common';
import { WebAppStack } from './stack.model';
import { dotnetCoreStack } from './stacks/dotnetCore';
import { javaStack } from './stacks/java';
import { aspDotnetStack } from './stacks/aspDotnet';
import { nodeStack } from './stacks/node';
import { rubyStack } from './stacks/ruby';
import { pythonStack } from './stacks/python';
import { phpStack } from './stacks/php';
import { javaContainersStack } from './stacks/javaContainers';

@Injectable()
export class WebAppStacksService20200601 {
  getStacks(): WebAppStack<any>[] {
    const stacks = [aspDotnetStack, dotnetCoreStack, javaStack, javaContainersStack, nodeStack, phpStack, pythonStack, rubyStack];

    return stacks;
  }
}
