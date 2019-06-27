export interface StorageAccount {
  primaryEndpoints: { [key: string]: string };
  primaryLocation: string;
  provisioningState: string;
  secondaryLocation: string;
  statusOfPrimary: string;
  statusOfSecondary: string;
}
