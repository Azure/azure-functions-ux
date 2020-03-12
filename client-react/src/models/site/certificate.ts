import { HostingEnvironmentProfile } from '../hostingEnvironment/hosting-environment-profile';
import { KeyValue } from '../portal-models';

export interface Certificate {
  friendlyName: string;
  subjectName: string;
  hostNames: string;
  pfxBlob: number;
  siteName: string;
  selfLink: string;
  issuer: string;
  issueDate: Date;
  expirationDate: Date;
  password: string;
  thumbprint: string;
  valid: boolean;
  toDelete: boolean;
  cerBlob: number;
  publicKeyHash: string;
  hostingEnvironment: string;
  hostingEnvironmentProfile: HostingEnvironmentProfile;
  keyVaultCsmId: string;
  keyVaultSecretName: string;
  webSpace: string;
  serverFarmId: string;
  geoRegion: string;
  name: string;
  tags: KeyValue<string>;
}

export interface Csr {
  name: string;
  distinguishedName: string;
  csrString: string;
  pfxBlob: number;
  password: string;
  publicKeyHash: string;
  hostingEnvironment: string;
}
