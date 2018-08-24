import { FunctionAppContext } from 'app/shared/function-app-context';
import { FunctionInfo } from 'app/shared/models/function-info';

export class WizardForm {
    public devEnvironment: devEnvironmentOptions;
    public workerRuntime: string;
    public portalTemplate: portalTemplateOptions;
    public deployment: deploymentOptions;
    public isLinux: boolean;
    public isLinuxConsumption: boolean;
    public context: FunctionAppContext;
    public functionsInfo: FunctionInfo[];
}

export type devEnvironmentOptions = 'vs' | 'vscode' | 'coretools' | 'maven' | 'portal';
export type portalTemplateOptions = 'HttpTrigger' | 'TimerTrigger' | 'QueueTrigger';
export type deploymentOptions = 'vsDirectPublish' | 'vscodeDirectPublish' | 'coretoolsDirectPublish' | 'mavenDirectPublish' | 'deploymentCenter';
// export type workerRuntimeOptions = 'dotnet' | 'node' | 'nodejs' | 'python' | 'java';