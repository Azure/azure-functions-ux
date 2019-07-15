// App Service Environment

export interface HostingEnvironmentProfile {
  id: string;
  name: string;
  type: string;
}

export interface HostingEnvironment {
  name: string;
  internalLoadBalancingMode?: InternalLoadBalancingModeType;
  vnetName: string;
}

export type InternalLoadBalancingModeType =
  | InternalLoadBalancingMode.None
  | InternalLoadBalancingMode.Web
  | InternalLoadBalancingMode.Publishing
  | InternalLoadBalancingMode.PublishingAndWeb;

export enum InternalLoadBalancingMode {
  // Serve all traffic on the public internet (default)
  None = 'None',
  // Serve web traffic (ports 80 and 443 plus remote debugging ports) privately
  Web = 'Web',
  // Serve FTP ports privately;
  // Publishing = whether the FTP endpoint is on the ILB
  Publishing = 'Publishing',
  // Both
  PublishingAndWeb = 'Web, Publishing',
}
