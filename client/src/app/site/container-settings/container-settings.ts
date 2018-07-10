import { ResourceId } from '../../shared/models/arm/arm-obj';
import { ContainerSettingsComponent } from './container-settings.component';

export interface ContainerSettingsInput<T> {
    id: ResourceId;
    data?: T;
    containerSettings: ContainerSettingsComponent;
}

export interface ContainerSettingsData {
    subscriptionId: string;
    location: string;
}
