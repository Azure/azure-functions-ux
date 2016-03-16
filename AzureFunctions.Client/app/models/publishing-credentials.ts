export interface PublishingCredentials {
    id: string;
    name: string;
    type: string;
    location: string;
    properties: {
        name: string;
        publishingUserName: string;
        publishingPassword: string;
        scmUri: string;
    }
}