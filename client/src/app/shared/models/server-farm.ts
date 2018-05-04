import { HostingEnvironmentProfile } from './arm/hosting-environment';
export interface ServerFarm {
    serverFarmName: string;
    armId: string;
    subscriptionId: string;
    resoruceGroupName: string;
    geoRegion: string;
    hostingEnvironmentProfile?: HostingEnvironmentProfile;
    provisioningState: 'InProgress' | 'Succeeded' | 'Failed';
    isXenon: boolean;
}
