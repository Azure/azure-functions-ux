export interface SourceControl {
    name: string;
    token: string;
    tokenSecret?: string;
    refreshToken?: string;
    environment?: string;
}

export interface ProviderToken {
    accessToken: string;
    refreshToken?: string;
    environment?: string;
}