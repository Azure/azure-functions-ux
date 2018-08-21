import { devEnvironmentOptions } from '../wizard-logic/quickstart-models';

export interface DevEnvironmentCard {
    id: devEnvironmentOptions;
    name: string;
    icon: string;
    color: string;
    description: string;
}
