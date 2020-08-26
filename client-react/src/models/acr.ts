export interface ACRRegistry {
  resourceId: string;
  loginServer: string;
  creationDate: string;
  provisioningState: string;
  adminUserEnabled: boolean;
  storageAccount: ACRRegistryStorage;
}

export interface ACRRegistryStorage {
  name: string;
}

export interface ACRCredential {
  username: string;
  passwords: ACRCredentialPassword[];
}

export interface ACRCredentialPassword {
  name: string;
  value: string;
}

export interface ACRDirectRequestPayload {
  subId: string;
  endpoint: string;
  username: string;
  password: string;
}

export interface ACRRepositories {
  repositories: string[];
}

export interface ACRTags {
  name: string;
  tags: string[];
}

export interface ACRWebhookPayload {
  serviceUri: string;
  customHeaders: { [key: string]: string };
  actions: string[];
  status: 'enabled' | 'disabled';
  scope: string;
}
