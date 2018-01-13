export interface ExtensionInstallStatus {
    id: string;
    status: 'Started' | 'Succeeded' | 'Failed';
    startTime: string;
    links: Array<{
        rel: string;
        href: string;
    }>;
}
