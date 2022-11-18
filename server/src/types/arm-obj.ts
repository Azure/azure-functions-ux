import { KeyValue } from '../proxy/proxy.controller';

export interface ArmObj<T> {
  id: string;
  kind?: string;
  cpp;
  properties: T;
  type?: string;
  tags?: KeyValue<string>;
  location: string;
  name: string;
  identity?: MsiIdentity;
  sku?: ArmSku;
}

export interface MsiIdentity {
  principalId: string;
  tenantId: string;
  type: string;
  userAssignedIdentities: KeyValue<KeyValue<string>>;
}

export interface ArmSku {
  name: string;
  tier: string;
  size: string;
  family: string;
  capacity: string;
}
