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

export interface ResourcesTopology {
  count: number;
  data: ResourceTologyData;
  facets: any[];
  maxRows: number;
  pagingEnabled: false;
  totalRecords: number;
}

export interface ResourceTologyData {
  columns: ResourceTopologyColumn[];
  // NOTE(michinoy): each row would contain an array of items.
  // The type of each item is determined through the type of the column.
  rows: any[][];
}

export interface ResourceTopologyColumn {
  name: string;
  type: string;
}
