export interface Host {
  swagger: Swagger;
  http: Http;
}

export interface HostV2 {
  version: string;
  swagger: Swagger;
  extensions: Extension;
}

export interface Swagger {
  enabled?: boolean;
}

export interface Http {
  routePrefix?: string;
}

export interface Extension {
  http: Http;
}
