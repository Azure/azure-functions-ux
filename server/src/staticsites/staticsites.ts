export enum PortalEnvironment {
  Mpac = 'MPAC',
  Preview = 'PREVIEW',
  Prod = 'PROD',
  Rc = 'RC',
}

export enum PortalEnvironmentUrl {
  Mpac = 'ms.portal.azure.com',
  Preview = 'preview.portal.azure.com',
  Prod = 'portal.azure.com',
  Rc = 'rc.portal.azure.com',
}

export const getPortalEnvironmentDomain = (environment?: string) => {
  switch (environment) {
    case PortalEnvironment.Mpac:
      return PortalEnvironmentUrl.Mpac;
    case PortalEnvironment.Preview:
      return PortalEnvironmentUrl.Preview;
    case PortalEnvironment.Prod:
      return PortalEnvironmentUrl.Prod;
    case PortalEnvironment.Rc:
      return PortalEnvironmentUrl.Rc;
    default:
      return PortalEnvironmentUrl.Prod;
  }
};
