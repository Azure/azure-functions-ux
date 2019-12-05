export interface Account {
  $type: string;
  $value: string;
}

export interface Properties {
  Account: Account;
}

export interface AuthenticatedUser {
  id: string;
  descriptor: string;
  subjectDescriptor: string;
  providerDisplayName: string;
  isActive: boolean;
  properties: Properties;
  resourceVersion: number;
  metaTypeId: number;
}

export interface AuthorizedUser {
  id: string;
  descriptor: string;
  subjectDescriptor: string;
  providerDisplayName: string;
  isActive: boolean;
  properties: Properties;
  resourceVersion: number;
  metaTypeId: number;
}

export interface LocationServiceData {
  serviceOwner: string;
  defaultAccessMappingMoniker: string;
  lastChangeId: number;
  lastChangeId64: number;
}

export interface AuthenticatedUserContext {
  authenticatedUser: AuthenticatedUser;
  authorizedUser: AuthorizedUser;
  instanceId: string;
  deploymentId: string;
  deploymentType: string;
  locationServiceData: LocationServiceData;
}

export interface DevOpsAccount {
  AccountId: string;
  NamespaceId: string;
  AccountName: string;
  OrganizationName?: string;
  AccountType: number;
  AccountOwner: string;
  CreatedBy: string;
  CreatedDate: Date;
  AccountStatus: number;
  StatusReason?: string;
  LastUpdatedBy: string;
  Properties: any;
  ForceMsaPassThrough: boolean;
}

export interface DevOpsProject {
  id: string;
  name: string;
  description: string;
  url: string;
  state: string;
  revision: number;
  visibility: string;
  lastUpdateTime: Date;
}

export interface DevOpsList<T> {
  count: number;
  value: T[];
}
