// Microsoft Graph / O365 binding definitions

export namespace MSGraphConstants {
  export class General {
    public static ApiVersion = '1.6';
    public static AADReplyUrl = '/.auth/login/aad/callback';
  }

  export class RequiredResources {
    public static MicrosoftGraph = '00000003-0000-0000-c000-000000000000';
    public static WindowsAzureActiveDirectory = '00000002-0000-0000-c000-000000000000';
  }
}

export enum ODataTypeMapping {
  Message = <any>'#Microsoft.Graph.Message',
  Contact = <any>'#Microsoft.Graph.Contact',
  Drive = <any>'#Microsoft.Graph.Drive',
  Event = <any>'#Microsoft.Graph.Event',
}

export class Moniker {
  public Resource: string;
  public IdToken: string;
  public PrincipalId: string;

  constructor(resource: string, idToken: string, principalId: string) {
    this.Resource = resource;
    this.IdToken = idToken;
    this.PrincipalId = principalId;
  }
}

export class GraphSubscription {
  public changeType: string;
  public notificationUrl: string;
  public resource: string;
  public expirationDateTime: string;
  public clientState: string;
  public id: string;

  constructor(changeType: string, notificationUrl: string, resource: string, expirationDatetime: string, clientState?: string) {
    this.changeType = changeType;
    this.notificationUrl = notificationUrl;
    this.resource = resource;
    this.expirationDateTime = expirationDatetime;
    this.clientState = clientState;
  }
}

export class GraphSubscriptionEntry {
  public SubscriptionId: string;
  public ClientState: string;
  public Moniker: string;

  constructor(SubscriptionId: string, ClientState: string, Moniker: string) {
    this.SubscriptionId = SubscriptionId;
    this.ClientState = ClientState;
    this.Moniker = Moniker;
  }
}

export class AADPermissions {
  public resourceAccess: ResourceAccess[];
  public resourceAppId: string;
}

export class ResourceAccess {
  public type: string;
  public id: string;
  public configured?: boolean;
}

export interface AADRegistrationInfo {
  isPermissionConfigured: boolean;
  isAADAppCreated: boolean;
  permissions: AADPermissions[];
}

export class AADDescriptionDescriptions {
  private _map: any = {};

  constructor() {
    this._map['00000002-0000-0000-c000-000000000000'] = 'Windows Azure Active Directory (Microsoft.Azure.ActiveDirectory)';
    this._map['311a71cc-e848-46a1-bdf8-97ff7156d8e6'] = 'Sign in and read user profile';
    this._map['00000003-0000-0000-c000-000000000000'] = 'Microsoft Graph';
    this._map['e1fe6dd8-ba31-4d61-89e7-88639da4683d'] = 'Sign in and read user profile';
    this._map['37f7f235-527c-4136-accd-4a02d197296e'] = 'Sign users in';
    this._map['024d486e-b451-40bb-833d-3e66d98c5c73'] = 'Read and write access to user mail';
    this._map['570282fd-fa5c-430d-a7fd-fc8dc98a9dca'] = 'Read user mail';
    this._map['e383f46e-2787-4529-855e-0e479a3ffac0'] = 'Send mail as a user';
    this._map['10465720-29dd-4523-a11a-6a75c743c9d9'] = 'Read user files';
    this._map['5c28f0bf-8a70-41f1-8ab2-9032436ddb65'] = 'Have full access to user files';
    this._map['df85f4d6-205c-4ac5-a5ea-6bf408dba283'] = 'Read all files that user can access';
    this._map['863451e7-0667-486c-a5d6-d135439485f0'] = 'Have full access to all files user can access';
    this._map['810c84a8-4a9e-49e6-bf7d-12d183f40d01'] = 'Read mail in all mailboxes';
  }

  get(key: string) {
    return this._map[key] ? this._map[key] : key;
  }
}
