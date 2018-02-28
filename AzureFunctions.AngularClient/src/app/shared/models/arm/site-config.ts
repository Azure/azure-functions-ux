import { VirtualApplication } from './virtual-application';
import { HandlerMapping } from './handler-mapping';
import { RoutingRule } from './routing-rule';

export interface SiteConfig {
    scmType: string;
    alwaysOn: boolean;
    cors: {
        allowedOrigins: string[]
    },
    apiDefinition: {
        url: string
    },
    netFrameworkVersion: string;
    phpVersion: string;
    javaVersion: string;
    javaContainer: string;
    javaContainerVersion: string;
    pythonVersion: string;
    use32BitWorkerProcess: boolean;
    webSocketsEnabled: boolean;
    managedPipelineMode: string;
    remoteDebuggingEnabled: boolean;
    remoteDebuggingVersion: string;
    defaultDocuments: string[];
    handlerMappings: HandlerMapping[];
    linuxFxVersion: string;
    appCommandLine: string;
    virtualApplications: VirtualApplication[];
    autoSwapSlotName: string;
    experiments: {
        rampUpRules: RoutingRule[];
    }
}
