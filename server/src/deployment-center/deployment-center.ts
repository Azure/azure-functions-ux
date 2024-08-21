export interface TokenData {
  authenticated: boolean;
  token: any;
}

export enum Environments {
  Prod = 'PROD',
  Stage = 'STAGE',
  Release = 'RELEASE',
  Next = 'NEXT',
  Dev = 'DEV',
}

export enum SandboxEnvironment {
  Prod = 'PROD',
  Mpac = 'MPAC',
  Rc = 'RC',
  Preview = 'PREVIEW',
}

export class EnvironmentUrlMappings {
  static readonly environmentToUrlMap: { [id in Environments]: string } = {
    PROD: 'https://functions.azure.com',
    STAGE: 'https://functions-staging.azure.com',
    RELEASE: 'https://functions-release.azure.com',
    NEXT: 'https://functions-next.azure.com',
    DEV: 'https://localhost:44300',
  };

  static readonly urlToEnvironmentMap: { [id: string]: Environments } = {
    'https://functions.azure.com': Environments.Prod,
    'https://functions-staging.azure.com': Environments.Stage,
    'https://functions-staging-westus-ame.azurewebsites.net': Environments.Stage,
    'https://functions-staging-westeurope-ame.azurewebsites.net': Environments.Stage,
    'https://functions-release.azure.com': Environments.Release,
    'https://functions-release-ame.azurewebsites.net': Environments.Release,
    'https://functions-next.azure.com': Environments.Next,
    'https://azure-functions-ux-next.azurewebsites.net': Environments.Next,
    'https://localhost:44300': Environments.Dev,
  };
}

export class SandboxEnvironmentUrlMappings {
  static readonly environmentToUrlMap: { [id in SandboxEnvironment]: string } = {
    PROD: '.reactblade.portal.azure.net',
    MPAC: '.reactblade-ms.portal.azure.net',
    RC: '.reactblade-rc.portal.azure.net',
    PREVIEW: '.reactblade-ms.portal.azure.net',
  };

  static readonly urlToEnvironmentMap: { [id: string]: SandboxEnvironment } = {
    '.reactblade.portal.azure.net': SandboxEnvironment.Prod,
    '.reactblade-ms.portal.azure.net': SandboxEnvironment.Mpac,
    '.reactblade-rc.portal.azure.net': SandboxEnvironment.Rc,
  };
}
