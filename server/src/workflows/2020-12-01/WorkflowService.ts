import { HttpException, Injectable } from '@nestjs/common';
import { LoggingService } from 'src/shared/logging/logging.service';
import { AppType, FunctionAppRuntimeStack, JavaContainers, Os, PublishType, WebAppRuntimeStack } from '../WorkflowModel';
const fs = require('fs');

@Injectable()
export class WorkflowService20201201 {
  loggingService: LoggingService;

  getWorkflowFile(appType: string, publishType: string, os: string, runtimeStack?: string, variables?: { [key: string]: string }) {
    let workflowFile: string =
      publishType.toLocaleLowerCase() === PublishType.Code
        ? this.getCodeWorkflowFile(appType, os, runtimeStack, variables)
        : this.getContainerWorkflowFile(os);

    Object.keys(variables).forEach(variableKey => {
      const replaceKey = `__${variableKey}__`;
      workflowFile = workflowFile.replace(new RegExp(replaceKey, 'gi'), variables[variableKey]);
    });

    return workflowFile;
  }

  getCodeWorkflowFile(appType: string, os: string, runtimeStack: string, variables?: { [key: string]: string }) {
    return appType.toLocaleLowerCase() === AppType.WebApp
      ? this.getWebAppCodeWorkflowFile(os, runtimeStack, variables)
      : this.getFunctionAppCodeWorkflowFile(os, runtimeStack);
  }

  getFunctionAppCodeWorkflowFile(providedOs: string, providedRuntimeStack: string) {
    return providedOs.toLocaleLowerCase() === Os.Linux
      ? this.getFunctionAppCodeLinuxWorkflowFile(providedOs, providedRuntimeStack)
      : this.getFunctionAppCodeWindowsWorkflowFile(providedOs, providedRuntimeStack);
  }

  getFunctionAppCodeLinuxWorkflowFile(providedOs: string, providedRuntimeStack: string) {
    const runtimeStack = providedRuntimeStack.toLocaleLowerCase();

    switch (runtimeStack) {
      case FunctionAppRuntimeStack.DotNetCore:
        return this.readWorkflowFile('function-app-configs/dotnetcore-linux.config.yml');
      case FunctionAppRuntimeStack.Java:
        return this.readWorkflowFile('function-app-configs/java-linux.config.yml');
      case FunctionAppRuntimeStack.Node:
        return this.readWorkflowFile('function-app-configs/node-linux.config.yml');
      case FunctionAppRuntimeStack.Python:
        return this.readWorkflowFile('function-app-configs/python-linux.config.yml');
      default:
        throw new HttpException(`The workflow file for the runtime stack '${runtimeStack}' and OS '${providedOs}' does not exist.`, 404);
    }
  }

  getFunctionAppCodeWindowsWorkflowFile(providedOs: string, providedRuntimeStack: string) {
    const runtimeStack = providedRuntimeStack.toLocaleLowerCase();

    switch (runtimeStack) {
      case FunctionAppRuntimeStack.Powershell:
        return this.readWorkflowFile('function-app-configs/powershell-windows.config.yml');
      case FunctionAppRuntimeStack.DotNetCore:
        return this.readWorkflowFile('function-app-configs/dotnetcore-windows.config.yml');
      case FunctionAppRuntimeStack.Java:
        return this.readWorkflowFile('function-app-configs/java-windows.config.yml');
      case FunctionAppRuntimeStack.Node:
        return this.readWorkflowFile('function-app-configs/node-windows.config.yml');
      default:
        throw new HttpException(`The workflow file for the runtime stack '${runtimeStack}' and OS '${providedOs}' does not exist.`, 404);
    }
  }

  getWebAppCodeWorkflowFile(providedOs: string, providedRuntimeStack: string, variables?: { [key: string]: string }) {
    return providedOs.toLocaleLowerCase() === Os.Linux
      ? this.getWebAppCodeLinuxWorkflowFile(providedOs, providedRuntimeStack, variables)
      : this.getWebAppCodeWindowsWorkflowFile(providedOs, providedRuntimeStack, variables);
  }

  getWebAppCodeLinuxWorkflowFile(providedOs: string, providedRuntimeStack: string, variables?: { [key: string]: string }) {
    const runtimeStack = providedRuntimeStack.toLocaleLowerCase();

    switch (runtimeStack) {
      case WebAppRuntimeStack.DotNetCore:
        return this.readWorkflowFile('web-app-configs/dotnetcore-linux.config.yml');
      case WebAppRuntimeStack.Java:
        if (this.javaWarWorkflowCheck(variables)) {
          return this.readWorkflowFile('web-app-configs/java-war-linux.config.yml');
        } else if (this.javaJarWorkflowCheck(variables)) {
          return this.readWorkflowFile('web-app-configs/java-jar-linux.config.yml');
        } else {
          throw new HttpException(`The java container must be specified`, 404);
        }
      case WebAppRuntimeStack.Node:
        return this.readWorkflowFile('web-app-configs/node-linux.config.yml');
      case WebAppRuntimeStack.Python:
        return this.readWorkflowFile('web-app-configs/python-linux.config.yml');
      default:
        throw new HttpException(`The workflow file for the runtime stack '${runtimeStack}' and OS '${providedOs}' does not exist.`, 404);
    }
  }

  getWebAppCodeWindowsWorkflowFile(providedOs: string, providedRuntimeStack: string, variables?: { [key: string]: string }) {
    const runtimeStack = providedRuntimeStack.toLocaleLowerCase();

    switch (runtimeStack) {
      case WebAppRuntimeStack.AspNet:
        return this.readWorkflowFile('web-app-configs/aspnet-windows.config.yml');
      case WebAppRuntimeStack.DotNetCore:
        return this.readWorkflowFile('web-app-configs/dotnetcore-windows.config.yml');
      case WebAppRuntimeStack.Java:
        if (this.javaWarWorkflowCheck(variables)) {
          return this.readWorkflowFile('web-app-configs/java-war-windows.config.yml');
        } else if (this.javaJarWorkflowCheck(variables)) {
          return this.readWorkflowFile('web-app-configs/java-jar-windows.config.yml');
        } else {
          throw new HttpException(`The java container must be specified`, 404);
        }
      case WebAppRuntimeStack.Node:
        return this.readWorkflowFile('web-app-configs/node-windows.config.yml');
      case WebAppRuntimeStack.Python:
        return this.readWorkflowFile('web-app-configs/python-windows.config.yml');
      default:
        throw new HttpException(`The workflow file for the runtime stack '${runtimeStack}' and OS '${providedOs}' does not exist.`, 404);
    }
  }

  javaWarWorkflowCheck(variables: { [key: string]: string }) {
    return variables && variables['javaContainer'] && variables['javaContainer'].toLocaleLowerCase() === JavaContainers.Tomcat;
  }

  javaJarWorkflowCheck(variables: { [key: string]: string }) {
    return variables && variables['javaContainer'] && variables['javaContainer'].toLocaleLowerCase() !== JavaContainers.Tomcat;
  }

  getContainerWorkflowFile(os: string) {
    if (os.toLocaleLowerCase() === Os.Linux) {
      return this.readWorkflowFile('container-configs/container-linux.config.yml');
    } else {
      throw new HttpException(`The workflow file for containers and OS '${os}' does not exist.`, 404);
    }
  }

  readWorkflowFile(filePath: string) {
    try {
      return fs.readFileSync(`./src/workflows/2020-12-01/${filePath}`, 'utf8');
    } catch (err) {
      this.loggingService.error(`Failed to read workflow file`);

      if (err.response) {
        throw new HttpException(err.response.data, err.response.status);
      }
      throw new HttpException('Internal Server Error', 500);
    }
  }
}
