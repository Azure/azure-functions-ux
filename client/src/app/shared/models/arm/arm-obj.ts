export type ResourceId = string;

export interface ArmObj<T> {
  id: string;
  name: string;
  type: string;
  kind: string;
  location: string;
  properties: T;
  identity?: Identity;
  sku?: Sku;
}

export interface ArmArrayResult<T> {
  value: ArmObj<T>[];
  nextLink: string;
}

export interface Identity {
  principalId: string;
  tenantId: string;
  type: string;
}

export interface Sku {
  name: string;
  tier?: string;
  size?: string;
  family?: string;
  capacity?: number;
}

export interface AvailableSku {
  sku: Sku;
}
