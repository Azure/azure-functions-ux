import { sourceControlProvider } from '../deployment-center-setup/wizard-logic/deployment-center-setup-models';

export interface ProviderCard {
    id: sourceControlProvider;
    name: string;
    icon: string;
    color: string;
    description: string;
    authorizedStatus: 'loadingAuth' | 'notAuthorized' | 'authorized' | 'none';
    authenticatedId?: string;
    scenarioId?: string;
    manual?: boolean;
}
