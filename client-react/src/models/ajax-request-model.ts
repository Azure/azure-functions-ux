/**
 *  NOTE(krmitta): This is exported directly from ibiza,
 *  so make sure to sync it with Ibiza before making any changes to the interfaces here
 */
export interface AuthorizationOptions {
  /**
   * The resource name to get the token for.
   */
  resourceName: string;
}

export interface NetAjaxSettings {
  /**
   * The URI to make the request to.
   */
  uri: string;

  type: string;

  /**
   * Determines whether to automatically obtain and append an authorization header.
   * If undefined, the authorization header is appendended automatically for all relative URIs,
   * but skipped for absolute URIs.
   *
   * Set to true to append the default authorization header.
   * Set to { resourceName: 'audienceName'} to append an authorization token targeted at a specific audience.
   */
  setAuthorizationHeader?: boolean | AuthorizationOptions;

  cache?: boolean;

  data?: any;

  contentType?: string;

  headers?: { [key: string]: any };
}
