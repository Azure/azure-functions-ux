export interface StaticSite {
  defaultHostname: string;
  repositoryUrl: string;
  branch: string;
  customDomains: any[]; // TODO(krmitta): Not sure what the interface for this looks like yet, update this whenever structure if decided
}
