import { portalTemplateOptions } from 'app/site/quickstart/wizard-logic/quickstart-models';

export interface PortalTemplateCard {
  id: portalTemplateOptions;
  name: string;
  icon: string;
  color: string;
  description: string;
}
