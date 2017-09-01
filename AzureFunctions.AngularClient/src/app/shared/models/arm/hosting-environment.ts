// App Service Environment

export interface HostingEnvironmentProfile {
    id: string;
    name: string;
    type: string;
}

export interface HostingEnvironment {
    name: string;
    internalLoadBalancingMode: 'Web' | 'None' | 'Publishing' | 'Web, Publishing' | null;
    vnetName: string;
}