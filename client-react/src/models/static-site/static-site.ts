export interface StaticSite {
  defaultHostname: string;
  repositoryUrl: string;
  branch: string;
  customDomains: any[]; // Not sure what the interface for this looks like yet.
}
