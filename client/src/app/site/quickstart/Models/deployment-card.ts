import { deploymentOptions } from 'app/site/quickstart/wizard-logic/quickstart-models';

export interface DeploymentCard {
  id: deploymentOptions;
  name: string;
  icon: string;
  color: string;
  description: string;
}
