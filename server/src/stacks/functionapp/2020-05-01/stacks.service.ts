import { Injectable } from '@nestjs/common';
import { FunctionAppStack } from './stack.model';
import { dotnetCoreStack } from './stacks/dotnetCore';
import { nodeStack } from './stacks/node';
import { pythonStack } from './stacks/python';
import { java8Stack } from './stacks/java8';
import { powershellStack } from './stacks/powershell';

@Injectable()
export class FunctionAppStacksService20200501 {
  getStacks(): FunctionAppStack[] {
    return [dotnetCoreStack, nodeStack, pythonStack, java8Stack, powershellStack];
  }
}
