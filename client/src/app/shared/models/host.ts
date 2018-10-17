export interface Host {
  swagger: Swagger;
  http: Http;
}

export interface Swagger {
  enabled?: boolean;
}

export interface Http {
  routePrefix?: string;
}
