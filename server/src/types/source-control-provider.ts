export interface SourceControlProvider {
  name: string;
  properties: {
    name: string;
    token?: string | null;
    tokenSecret?: string | null;
    refreshToken?: string | null;
    expirationTime?: string | null;
    environment?: string | null;
  };
}
