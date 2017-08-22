import 'core-js/es6/symbol';

interface Environment {
  hostName: string;
  runtimeType: 'OnPrem' | 'Azure' | 'Standalone';
  azureResourceManagerEndpoint: string;
}

interface AppSvc {
  env: Environment;
}

declare global {
  interface Window {
    appsvc: AppSvc;
  }
}