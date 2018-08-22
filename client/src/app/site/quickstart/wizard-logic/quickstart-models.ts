export class WizardForm {
    public devEnvironment: devEnvironmentOptions;
    public workerRuntime: string;
    public portalTemplate: portalTemplateOptions;
    public isLinux: boolean;
    public isLinuxConsumption: boolean;
}

export type devEnvironmentOptions = 'vs' | 'vscode' | 'coretools' | 'maven' | 'portal';
export type portalTemplateOptions = 'HttpTrigger' | 'TimerTrigger' | 'QueueTrigger';
// export type workerRuntimeOptions = 'dotnet' | 'node' | 'nodejs' | 'python' | 'java';