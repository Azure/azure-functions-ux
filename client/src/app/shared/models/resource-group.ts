export interface ResourceGroup {
    id: string;
    name: string;
    location: string;
    properties: { provisioningState: string }
}