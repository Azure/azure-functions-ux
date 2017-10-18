import { FunctionsVersionInfo } from './../../common/models/functions-version-info';

interface StaticConfig {
    config: {
        env: {
            runtimeType: 'Azure' | 'OnPrem' | 'Standalone';
            azureResourceManagerEndpoint: string;
            hostName: string | undefined;
        },
        functionsVersionInfo: FunctionsVersionInfo,
        isAzure: boolean;
        isOnPrem: boolean;
    }
}

export const staticConfig: StaticConfig = {
    config: {
        env: {
            runtimeType: 'Azure',
            azureResourceManagerEndpoint: 'https://management.azure.com',
            hostName: process.env.WEBSITE_HOSTNAME,
        },
        functionsVersionInfo: {
            runtimeStable: ['~1', '~2', 'latest'],
            runtimeDefault: '~1'
        },
        // TODO: [ehamai] I wouldn't use "isAzure" or "isOnPrem" as properties. RuntimeType should contain all of those variations.
        isAzure: !!process.env.WEBSITE_SITE_NAME,
        isOnPrem: false
    }
};