export interface HostStatus {
    id: string;
    version: string;
    state: 'Default' | 'Initialized' | 'Running' | 'Error';
    errors: string[];
}
