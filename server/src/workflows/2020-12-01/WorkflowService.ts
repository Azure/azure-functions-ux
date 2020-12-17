import { HttpException, Injectable } from '@nestjs/common';
import { AppType, FunctionAppRuntimeStack, JavaContainers, Os, PublishType, WebAppRuntimeStack } from '../WorkflowModel';
const fs = require('fs');

@Injectable()
export class WorkflowService20201201 {
  getWorkflowFile(appType: string, publishType: string, os: string, runtimeStack?: string, variables?: { [key: string]: string }) {
    //TODO(stpelleg): find and replace variables in the workflow file

    return publishType === PublishType.Code
      ? this.getCodeWorkflowFile(appType, os, runtimeStack, variables)
      : this.getContainerWorkflowFile(os);
  }

  getCodeWorkflowFile(appType?: string, os?: string, runtimeStack?: string, variables?: { [key: string]: string }) {
    return appType === AppType.WebApp
      ? this.getWebAppCodeWorkflowFile(os, runtimeStack, variables)
      : this.getFunctionAppCodeWorkflowFile(os, runtimeStack);
  }

  getFunctionAppCodeWorkflowFile(os: string, runtimeStack?: string) {
    if (os === Os.Linux && runtimeStack === FunctionAppRuntimeStack.DotNetCore) {
      return this.readWorkflowFile('function-app-configs/dotnetcore-linux.config.yml');
    } else if (os === Os.Linux && runtimeStack === FunctionAppRuntimeStack.Java) {
      return this.readWorkflowFile('function-app-configs/java-linux.config.yml');
    } else if (os === Os.Linux && runtimeStack === FunctionAppRuntimeStack.Node) {
      return this.readWorkflowFile('function-app-configs/node-linux.config.yml');
    } else if (os === Os.Linux && runtimeStack === FunctionAppRuntimeStack.Python) {
      return this.readWorkflowFile('function-app-configs/python-linux.config.yml');
    } else if (os === Os.Windows && runtimeStack === FunctionAppRuntimeStack.Powershell) {
      return this.readWorkflowFile('function-app-configs/powershell-windows.config.yml');
    } else if (os === Os.Windows && runtimeStack === WebAppRuntimeStack.DotNetCore) {
      return this.readWorkflowFile('function-app-configs/dotnetcore-windows.config.yml');
    } else if (os === Os.Windows && runtimeStack === WebAppRuntimeStack.Java) {
      return this.readWorkflowFile('function-app-configs/java-windows.config.yml');
    } else if (os === Os.Windows && runtimeStack === WebAppRuntimeStack.Node) {
      return this.readWorkflowFile('function-app-configs/node-windows.config.yml');
    } else {
      throw new HttpException(`The workflow file for the runtime stack '${runtimeStack}' and OS '${os}' does not exist.`, 404);
    }
  }

  getWebAppCodeWorkflowFile(os: string, runtimeStack?: string, variables?: { [key: string]: string }) {
    if (os === Os.Linux && runtimeStack === WebAppRuntimeStack.DotNetCore) {
      return this.readWorkflowFile('web-app-configs/dotnetcore-linux.config.yml');
    } else if (os === Os.Linux && runtimeStack === WebAppRuntimeStack.Java && this.javaWarWorkflowCheck(variables)) {
      return this.readWorkflowFile('web-app-configs/java-war-linux.config.yml');
    } else if (os === Os.Linux && runtimeStack === WebAppRuntimeStack.Java && this.javaJarWorkflowCheck(variables)) {
      return this.readWorkflowFile('web-app-configs/java-jar-linux.config.yml');
    } else if (os === Os.Linux && runtimeStack === WebAppRuntimeStack.Node) {
      return this.readWorkflowFile('web-app-configs/node-linux.config.yml');
    } else if (os === Os.Linux && runtimeStack === WebAppRuntimeStack.Python) {
      return this.readWorkflowFile('web-app-configs/python-linux.config.yml');
    } else if (os === Os.Windows && runtimeStack === WebAppRuntimeStack.AspNet) {
      return this.readWorkflowFile('web-app-configs/aspnet-windows.config.yml');
    } else if (os === Os.Windows && runtimeStack === WebAppRuntimeStack.DotNetCore) {
      return this.readWorkflowFile('web-app-configs/dotnetcore-windows.config.yml');
    } else if (os === Os.Windows && runtimeStack === WebAppRuntimeStack.Java && this.javaWarWorkflowCheck(variables)) {
      return this.readWorkflowFile('web-app-configs/java-war-windows.config.yml');
    } else if (os === Os.Windows && runtimeStack === WebAppRuntimeStack.Java && this.javaJarWorkflowCheck(variables)) {
      return this.readWorkflowFile('web-app-configs/java-jar-windows.config.yml');
    } else if (os === Os.Windows && runtimeStack === WebAppRuntimeStack.Node) {
      return this.readWorkflowFile('web-app-configs/node-windows.config.yml');
    } else if (os === Os.Windows && runtimeStack === WebAppRuntimeStack.Python) {
      return this.readWorkflowFile('web-app-configs/python-windows.config.yml');
    } else {
      const errMsg =
        runtimeStack === WebAppRuntimeStack.Java
          ? `The java container must be specified`
          : `The workflow file for the runtime stack '${runtimeStack}' and OS '${os}' does not exist.`;
      throw new HttpException(errMsg, 404);
    }
  }

  javaWarWorkflowCheck(variables: { [key: string]: string }) {
    return variables && variables['javaContainer'] && variables['javaContainer'].toLocaleLowerCase() === JavaContainers.Tomcat;
  }

  javaJarWorkflowCheck(variables: { [key: string]: string }) {
    return variables && variables['javaContainer'] && variables['javaContainer'].toLocaleLowerCase() !== JavaContainers.Tomcat;
  }

  getContainerWorkflowFile(os: string) {
    if (os === Os.Linux) {
      return this.readWorkflowFile('container-configs/container-linux.config.yml');
    } else {
      throw new HttpException(`The workflow file for containers and OS '${os}' does not exist.`, 404);
    }
  }

  readWorkflowFile(filePath: string) {
    try {
      return fs.readFileSync(`./src/workflows/2020-12-01/${filePath}`, 'utf8');
    } catch (err) {
      if (err.response) {
        throw new HttpException(err.response.data, err.response.status);
      }
      throw new HttpException('Internal Server Error', 500);
    }
  }
}
