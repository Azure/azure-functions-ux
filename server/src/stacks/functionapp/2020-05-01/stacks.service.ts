import { Injectable } from '@nestjs/common';
import { FunctionAppStack } from './stack.model';
import { dotnetCoreStack } from './stacks/dotnetCore';
import { nodeStack } from './stacks/node';
import { pythonStack } from './stacks/python';
import { javaStack } from './stacks/java';
import { powershellStack } from './stacks/powershell';
import { customStack } from './stacks/custom';

@Injectable()
export class FunctionAppStacksService20200501 {
  getStacks(): FunctionAppStack[] {
    return [dotnetCoreStack, nodeStack, pythonStack, javaStack, powershellStack, customStack];
  }
}
