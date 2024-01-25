import { HttpException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { join, normalize } from 'path';
import { AppType, JavaContainers, Os, PublishType, RuntimeStacks, AuthType } from '../WorkflowModel';

@Injectable()
export class WorkflowService20221001 {
  getWorkflowFile(
    appType: string,
    publishType: string,
    os: string,
    runtimeStack?: string,
    variables?: { [key: string]: string },
    authType?: string
  ) {
    let workflowFile: string =
      publishType.toLocaleLowerCase() === PublishType.Code
        ? this.getCodeWorkflowFile(appType, os, runtimeStack, variables)
        : this.getContainerWorkflowFile(appType, os);

    const loginToAzureStepPlaceholder = '__login-to-azure-step__';
    const publishProfilePlaceholder = '__publishing-profile__';
    const permissionsPlaceholder = '__permissions__';
    if (authType === AuthType.Oidc) {
      //NOTE (stpelleg): OIDC with GitHub Actions requires the id-token permissions to be set to write
      // and the addition of a login to Azure step
      const loginToAzureStep = `
      - name: Login to Azure
        uses: azure/login@v1
        with:
          client-id: \${{ secrets.__clientidsecretname__ }}
          tenant-id: \${{ secrets.__tenantidsecretname__ }}
          subscription-id: \${{ secrets.__subscriptionidsecretname__ }}\n`;
      const permssions = `permissions:
      id-token: write #This is required for requesting the JWT\n`;
      workflowFile = workflowFile.replace(new RegExp(publishProfilePlaceholder, 'gi'), '');
      workflowFile = workflowFile.replace(new RegExp(loginToAzureStepPlaceholder, 'gi'), loginToAzureStep);
      workflowFile = workflowFile.replace(new RegExp(permissionsPlaceholder, 'gi'), permssions);
    } else {
      workflowFile = workflowFile.replace(
        new RegExp(publishProfilePlaceholder, 'gi'),
        'publish-profile: ${{ secrets.__publishingprofilesecretname__ }}'
      );
      workflowFile = workflowFile.replace(new RegExp(loginToAzureStepPlaceholder, 'gi'), '');
      workflowFile = workflowFile.replace(new RegExp(permissionsPlaceholder, 'gi'), '');
    }

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
      case RuntimeStacks.Dotnet: // falls through
      case RuntimeStacks.DotnetIsolated:
        return this.readWorkflowFile('function-app-configs/dotnetcore-linux.config.yml');
      case RuntimeStacks.Java:
        return this.readWorkflowFile('function-app-configs/java-linux.config.yml');
      case RuntimeStacks.Node:
        return this.readWorkflowFile('function-app-configs/node-linux.config.yml');
      case RuntimeStacks.Python:
        return this.readWorkflowFile('function-app-configs/python-linux.config.yml');
      case RuntimeStacks.Powershell:
        return this.readWorkflowFile('function-app-configs/powershell-linux.config.yml');
      default:
        throw new HttpException(`The workflow file for the runtime stack '${runtimeStack}' and OS '${providedOs}' does not exist.`, 404);
    }
  }

  getFunctionAppCodeWindowsWorkflowFile(providedOs: string, providedRuntimeStack: string) {
    const runtimeStack = providedRuntimeStack.toLocaleLowerCase();

    switch (runtimeStack) {
      case RuntimeStacks.Powershell:
        return this.readWorkflowFile('function-app-configs/powershell-windows.config.yml');
      case RuntimeStacks.Dotnet:
        return this.readWorkflowFile('function-app-configs/dotnetcore-windows.config.yml');
      case RuntimeStacks.Java:
        return this.readWorkflowFile('function-app-configs/java-windows.config.yml');
      case RuntimeStacks.Node:
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
      case RuntimeStacks.Dotnet:
        return this.readWorkflowFile('web-app-configs/dotnetcore-linux.config.yml');
      case RuntimeStacks.Java:
        if (this.javaWarWorkflowCheck(variables)) {
          return this.readWorkflowFile('web-app-configs/java-war-linux.config.yml');
        } else if (this.javaJarWorkflowCheck(variables)) {
          return this.readWorkflowFile('web-app-configs/java-jar-linux.config.yml');
        } else {
          throw new HttpException(`The java container must be specified`, 404);
        }
      case RuntimeStacks.Node:
        return this.readWorkflowFile('web-app-configs/node-linux.config.yml');
      case RuntimeStacks.Python:
        return this.readWorkflowFile('web-app-configs/python-linux.config.yml');
      case RuntimeStacks.Php:
        return this.readWorkflowFile('web-app-configs/php-linux.config.yml');
      case RuntimeStacks.WordPress:
        return this.readWorkflowFile('web-app-configs/wordpress-linux.config.yml');
      default:
        throw new HttpException(`The workflow file for the runtime stack '${runtimeStack}' and OS '${providedOs}' does not exist.`, 404);
    }
  }

  getWebAppCodeWindowsWorkflowFile(providedOs: string, providedRuntimeStack: string, variables?: { [key: string]: string }) {
    const runtimeStack = providedRuntimeStack.toLocaleLowerCase();

    switch (runtimeStack) {
      case RuntimeStacks.Dotnet:
        return variables['runtimeVersion'].toLocaleLowerCase() === 'v4.0' || variables['runtimeVersion'].toLocaleLowerCase() === 'v2.0'
          ? this.readWorkflowFile('web-app-configs/aspnet-windows.config.yml')
          : this.readWorkflowFile('web-app-configs/dotnetcore-windows.config.yml');
      case RuntimeStacks.Java:
        if (this.javaWarWorkflowCheck(variables)) {
          return this.readWorkflowFile('web-app-configs/java-war-windows.config.yml');
        } else if (this.javaJarWorkflowCheck(variables)) {
          return this.readWorkflowFile('web-app-configs/java-jar-windows.config.yml');
        } else {
          throw new HttpException(`The java container must be specified`, 404);
        }
      case RuntimeStacks.Node:
        return this.readWorkflowFile('web-app-configs/node-windows.config.yml');
      case RuntimeStacks.Python:
        return this.readWorkflowFile('web-app-configs/python-windows.config.yml');
      case RuntimeStacks.Php:
        return this.readWorkflowFile('web-app-configs/php-windows.config.yml');
      default:
        throw new HttpException(`The workflow file for the runtime stack '${runtimeStack}' and OS '${providedOs}' does not exist.`, 404);
    }
  }

  javaWarWorkflowCheck(variables: { [key: string]: string }) {
    return (
      !!variables &&
      !!variables['javaContainer'] &&
      (variables['javaContainer'].toLocaleLowerCase() === JavaContainers.Tomcat ||
        variables['javaContainer'].toLocaleLowerCase() === JavaContainers.JBoss)
    );
  }

  javaJarWorkflowCheck(variables: { [key: string]: string }) {
    return !!variables && !!variables['javaContainer'] && variables['javaContainer'].toLocaleLowerCase() === JavaContainers.JavaSE;
  }

  getContainerWorkflowFile(appType: string, os: string) {
    if (appType.toLocaleLowerCase() === AppType.WebApp && os.toLocaleLowerCase() === Os.Linux) {
      return this.readWorkflowFile('container-configs/container-webapp-linux.config.yml');
    } else if (appType.toLocaleLowerCase() === AppType.FunctionApp && os.toLocaleLowerCase() == Os.Linux) {
      return this.readWorkflowFile('container-configs/container-functions-linux.config.yml');
    } else if (appType.toLocaleLowerCase() === AppType.WebApp && os.toLocaleLowerCase() === Os.Windows) {
      return this.readWorkflowFile('container-configs/container-webapp-windows.config.yml');
    } else {
      throw new HttpException(`The workflow file for containers with app type ${appType} and OS '${os}' does not exist.`, 404);
    }
  }

  readWorkflowFile(filePath: string) {
    try {
      const workflowFileParts = filePath.split('/');
      const workflowFileLoc = normalize(join(__dirname, `${workflowFileParts[0]}`, `${workflowFileParts[1]}`));
      return fs.readFileSync(workflowFileLoc, 'utf8');
    } catch (err) {
      if (err.response) {
        throw new HttpException(err.response.data, err.response.status);
      }
      throw new HttpException(JSON.stringify(err), 500);
    }
  }
}
