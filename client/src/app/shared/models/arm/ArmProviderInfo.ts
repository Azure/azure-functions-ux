export interface ArmProviderInfo {
    resourceTypes: ResourceType[];
}

export interface ResourceType {
    resourceType: string;
    locations: string[];
}