import { FunctionAppContext } from './../../../shared/function-app-context';

export class WizardForm {
    public devEnvironment: devEnvironmentOptions;
    public workerRuntime: workerRuntimeOptions;
    public portalTemplate: portalTemplateOptions;
    public deployment: deploymentOptions;
    public instructions: string;
    public context: FunctionAppContext;
    public isLinux: boolean;
    public isLinuxConsumption: boolean;
    public subscriptionName: string;
}

export type devEnvironmentOptions = 'vs' | 'vscode' | 'coretools' | 'maven' | 'portal';
export type workerRuntimeOptions = 'dotnet' | 'node' | 'nodejs' | 'python' | 'java';
export type portalTemplateOptions = 'HttpTrigger' | 'TimerTrigger' | 'QueueTrigger';
export type deploymentOptions = 'vsDirectPublish' | 'vscodeDirectPublish' | 'coretoolsDirectPublish' | 'mavenDirectPublish' | 'deploymentCenter';
