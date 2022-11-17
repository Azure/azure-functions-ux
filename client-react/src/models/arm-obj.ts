import { KeyValue } from './portal-models';

export interface MsiIdentity {
  principalId: string;
  tenantId: string;
  type: string;
  userAssignedIdentities: KeyValue<KeyValue<string>>;
}
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

export type UntrackedArmObj<T> = Omit<ArmObj<T>, 'location' | 'name'>;

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

export interface Identity {
  principalId: string;
  tenantId: string;
  type: string;
  userAssignedIdentities: KeyValue<KeyValue<string>>;
}

export interface ResourceGraph {
  count: number;
  data: ResourceGraphData;
  facets: any[];
  maxRows: number;
  pagingEnabled: false;
  totalRecords: number;
}

export interface ResourceGraphData {
  columns: ResourceGraphColumn[];
  rows: any[][];
}

export interface ResourceGraphColumn {
  name: string;
  type: string;
}
