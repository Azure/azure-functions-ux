import { sourceControlProvider } from '../deployment-center-setup/wizard-logic/deployment-center-setup-models';

export interface ProviderCard {
  id: sourceControlProvider;
  name: string;
  icon: string;
  color: string;
  description: string;
  authorizedStatus: 'loadingAuth' | 'notAuthorized' | 'authorized' | 'none';
  enabled: boolean;
  hidden?: boolean;
  errorMessage?: string;
  authenticatedId?: string;
  scenarioId?: string;
  manual?: boolean;
  deploymentType?: 'continuous' | 'manual';
}
