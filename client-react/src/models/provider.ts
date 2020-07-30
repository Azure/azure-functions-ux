export interface SourceControl {
  tokenSecret?: string;
  refreshToken?: string;
  environment?: string;
  name: string;
  token: string;
}

export interface ProviderToken {
  refreshToken?: string;
  environment?: string;
  accessToken: string;
}
