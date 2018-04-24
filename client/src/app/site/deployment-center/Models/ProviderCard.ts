import { sourceControlProvider } from '../deployment-center-setup/wizard-logic/deployment-center-setup-models';

export interface ProviderCard {
    id: sourceControlProvider;
    name: string;
    icon: string;
    color: string;
    barColor: string;
    description: string;
    authorizedStatus: 'loadingAuth' | 'notAuthorized' | 'authorized' | 'none';
    authenticatedId?: string;
    manual?: boolean;
}
