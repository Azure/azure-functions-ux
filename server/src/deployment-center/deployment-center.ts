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

export enum ReactViewsEnvironment {
  Prod = 'PROD',
  Mpac = 'MPAC',
  Rc = 'RC',
  Preview = 'PREVIEW',
}

export enum ExtensionNames {
  Websites = 'WEBSITES',
  PaasServerless = 'PAASSERVERLESS',
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
    'https://functions-staging-westus-ame-staging.azurewebsites.net': Environments.Stage,
    'https://functions-staging-westeurope-ame-staging.azurewebsites.net': Environments.Stage,
    'https://functions-release.azure.com': Environments.Release,
    'https://functions-release-ame.azurewebsites.net': Environments.Release,
    'https://functions-next.azure.com': Environments.Next,
    'https://azure-functions-ux-next.azurewebsites.net': Environments.Next,
    'https://localhost:44300': Environments.Dev,
  };
}

export class ReactViewsEnvironmentUrlMappings {
  static readonly environmentToUrlMap: { [id in ReactViewsEnvironment]: string } = {
    PROD: 'https://portal.azure.com',
    MPAC: 'https://ms.portal.azure.com',
    RC: 'https://rc.portal.azure.com',
    PREVIEW: 'https://preview.portal.azure.com',
  };

  static readonly urlToEnvironmentMap: { [id: string]: ReactViewsEnvironment } = {
    'https://portal.azure.com': ReactViewsEnvironment.Prod,
    'https://ms.portal.azure.com': ReactViewsEnvironment.Mpac,
    'https://rc.portal.azure.com': ReactViewsEnvironment.Rc,
    'https://preview.portal.azure.com': ReactViewsEnvironment.Preview,
  };
}

export class ExtensionMappings {
  static readonly extensionToExtensionNameMap: { [id in ExtensionNames]: string } = {
    WEBSITES: 'WebsitesExtension',
    PAASSERVERLESS: 'Microsoft_Azure_PaasServerless',
  };

  static readonly extensionNameToExtensionMap: { [id: string]: ExtensionNames } = {
    WebsitesExtension: ExtensionNames.Websites,
    Microsoft_Azure_PaasServerless: ExtensionNames.PaasServerless,
  };
}
