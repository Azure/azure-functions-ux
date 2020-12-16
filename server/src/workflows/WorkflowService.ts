import { Injectable } from '@nestjs/common';
import { AppType, CodeVariables, ContainerVariables, FunctionAppRuntimeStack, Os, PublishType, WebAppRuntimeStack } from './WorkflowModel';

@Injectable()
export class WorkflowService20201201 {
  getWorkflowFile(
    appType?: AppType,
    publishType?: PublishType,
    os?: Os,
    runtimeStack?: FunctionAppRuntimeStack | WebAppRuntimeStack,
    variables?: CodeVariables | ContainerVariables
  ) {
    return appType === AppType.WebApp
      ? this.getFunctionAppWorkflowFile(publishType, os, runtimeStack, variables)
      : this.getWebAppWorkflowFile(publishType, os, runtimeStack, variables);
  }

  getFunctionAppWorkflowFile(
    publishType?: PublishType,
    os?: Os,
    runtimeStack?: FunctionAppRuntimeStack | WebAppRuntimeStack,
    variables?: CodeVariables
  ) {
    return;
  }

  getWebAppWorkflowFile(
    publishType?: PublishType,
    os?: Os,
    runtimeStack?: FunctionAppRuntimeStack | WebAppRuntimeStack,
    variables?: CodeVariables | ContainerVariables
  ) {
    return publishType === PublishType.Code
      ? this.getWebAppCodeWorkflowFile(os, runtimeStack, variables)
      : this.getWebAppContainerWorkflowFile(os, runtimeStack, variables);
  }

  getWebAppCodeWorkflowFile(os?: Os, runtimeStack?: FunctionAppRuntimeStack | WebAppRuntimeStack, variables?: CodeVariables) {
    return;
  }

  getWebAppContainerWorkflowFile(os?: Os, runtimeStack?: FunctionAppRuntimeStack | WebAppRuntimeStack, variables?: ContainerVariables) {
    return;
  }
}
