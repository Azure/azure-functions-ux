export interface MsiIdentity {
  principalId: string;
  tenantId: string;
  type: string;
}
export interface ArmObj<T> {
  id: string;
  kind?: string;
  properties: T;
  type?: string;
  tags?: { [key: string]: string };
  location: string;
  name: string;
  identity?: MsiIdentity;
  sku?: ArmSku;
}

export interface ArmArray<T> {
  value: ArmObj<T>[];
  nextLink?: string | null;
  id?: string;
}

export interface ArmSku {
  name: string;
  tier: string;
  size: string;
  family: string;
  capacity: string;
}

export interface AvailableSku {
  sku: ArmSku;
}
