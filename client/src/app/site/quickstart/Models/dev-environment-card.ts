import { devEnvironmentOptions } from 'app/site/quickstart/wizard-logic/quickstart-models';

export interface DevEnvironmentCard {
  id: devEnvironmentOptions;
  name: string;
  icon: string;
  description: string;
}
