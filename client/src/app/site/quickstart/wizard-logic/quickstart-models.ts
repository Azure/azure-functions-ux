export class WizardForm {
    public devEnvironment: devEnvironmentOptions;
    public workerRuntime: string;
}

export type devEnvironmentOptions = 'vs' | 'vscode' | 'external' | 'portal';
// export type workerRuntimeOptions = 'dotnet' | 'node' | 'nodejs' | 'python' | 'java';