export interface SourceControl {
    name: string;
    token: string;
    tokenSecret?: string;
    refreshToken?: string;
    environment?: string;
}