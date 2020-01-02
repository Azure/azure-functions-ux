export interface Host {
  swagger: Swagger;
  http: Http;
  version: string;
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
