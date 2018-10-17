export interface StorageAccount {
  id: string;
  location: string;
  name: string;
  properties: {
    accountType: string;
    creationTime: string;
    provisioningState: string;
  };
}
