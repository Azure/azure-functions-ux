import { HttpException, Injectable } from '@nestjs/common';
import { AppType, FunctionAppRuntimeStack, JavaContainers, Os, PublishType, WebAppRuntimeStack } from '../WorkflowModel';

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
      ? this.getFunctionAppCodeWorkflowFile(os, runtimeStack)
      : this.getWebAppCodeWorkflowFile(os, runtimeStack, variables);
  }

  getFunctionAppCodeWorkflowFile(os: string, runtimeStack?: string) {
    if (os === Os.Linux && runtimeStack === FunctionAppRuntimeStack.DotNetCore) {
      return 'dotnetcore-linux.config.yml';
    } else if (os === Os.Linux && runtimeStack === FunctionAppRuntimeStack.Java) {
      return 'java-linux.config.yml';
    } else if (os === Os.Linux && runtimeStack === FunctionAppRuntimeStack.Node) {
      return 'node-linux.config.yml';
    } else if (os === Os.Linux && runtimeStack === FunctionAppRuntimeStack.Python) {
      return 'python-linux.config.yml';
    } else if (os === Os.Windows && runtimeStack === FunctionAppRuntimeStack.Powershell) {
      return 'powershell-windows.config.yml';
    } else if (os === Os.Windows && runtimeStack === WebAppRuntimeStack.DotNetCore) {
      return 'dotnetcore-windows.config.yml';
    } else if (os === Os.Windows && runtimeStack === WebAppRuntimeStack.Java) {
      return 'java-windows.config.yml';
    } else if (os === Os.Windows && runtimeStack === WebAppRuntimeStack.Node) {
      return 'node-windows.config.yml';
    } else {
      throw new HttpException(`The workflow file for the runtime stack ${runtimeStack} and OS ${os} does not exist.`, 404);
    }
  }

  getWebAppCodeWorkflowFile(os: string, runtimeStack?: string, variables?: { [key: string]: string }) {
    if (os === Os.Linux && runtimeStack === WebAppRuntimeStack.DotNetCore) {
      return 'dotnetcore-linux.config.yml';
    } else if (
      os === Os.Linux &&
      runtimeStack === WebAppRuntimeStack.Java &&
      variables.javaContainer &&
      variables.javaContainer === JavaContainers.Tomcat
    ) {
      return 'java-war-linux.config.yml';
    } else if (
      os === Os.Linux &&
      runtimeStack === WebAppRuntimeStack.Java &&
      variables.javaContainer &&
      variables.javaContainer !== JavaContainers.Tomcat
    ) {
      return 'java-jar-linux.config.yml';
    } else if (os === Os.Linux && runtimeStack === WebAppRuntimeStack.Node) {
      return 'node-linux.config.yml';
    } else if (os === Os.Linux && runtimeStack === WebAppRuntimeStack.Python) {
      return 'python-linux.config.yml';
    } else if (os === Os.Windows && runtimeStack === WebAppRuntimeStack.AspNet) {
      return 'aspnet-windows.config.yml';
    } else if (os === Os.Windows && runtimeStack === WebAppRuntimeStack.DotNetCore) {
      return 'dotnetcore-windows.config.yml';
    } else if (
      os === Os.Windows &&
      runtimeStack === WebAppRuntimeStack.Java &&
      variables.javaContainer &&
      variables.javaContainer === JavaContainers.Tomcat
    ) {
      return 'java-war-windows.config.yml';
    } else if (
      os === Os.Windows &&
      runtimeStack === WebAppRuntimeStack.Java &&
      variables.javaContainer &&
      variables.javaContainer !== JavaContainers.Tomcat
    ) {
      return 'java-jar-windows.config.yml';
    } else if (os === Os.Windows && runtimeStack === WebAppRuntimeStack.Node) {
      return 'node-windows.config.yml';
    } else if (os === Os.Windows && runtimeStack === WebAppRuntimeStack.Python) {
      return 'python-windows.config.yml';
    } else {
      throw new HttpException(`The workflow file for the runtime stack ${runtimeStack} and OS ${os} does not exist.`, 404);
    }
  }

  getContainerWorkflowFile(os: string) {
    if (os === Os.Linux) {
      return 'container-linux.config.yml';
    } else {
      throw new HttpException(`The workflow file for containers and OS ${os} does not exist.`, 404);
    }
  }

  readWorkflowFile(filePath: string) {
    const fs = require('fs');

    fs.open(filePath, 'r', (err, fd) => {
      fs.read(fd, (err, bytes, buff) => {
        console.log(buff.toString());
      });
    });
  }
}
