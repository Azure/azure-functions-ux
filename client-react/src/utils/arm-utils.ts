import { AppKind } from './AppKind';
import { ArmObj, ResourceGraphColumn, Identity, ArmSku } from '../models/arm-obj';
import { Site } from '../models/site/site';
import { CommonConstants } from './CommonConstants';

export function isFunctionApp(obj: ArmObj<any>): boolean {
  return AppKind.hasKinds(obj, ['functionapp']) && !AppKind.hasKinds(obj, ['botapp']);
}

export function isLinuxApp(obj: ArmObj<any>): boolean {
  return AppKind.hasKinds(obj, ['linux']);
}

export function isLinuxDynamic(obj: ArmObj<Site>) {
  return isLinuxApp(obj) && !!obj.properties.sku && obj.properties.sku.toLocaleLowerCase() === CommonConstants.SkuNames.dynamic;
}

export function isContainerApp(obj: ArmObj<Site>): boolean {
  return AppKind.hasKinds(obj, ['container']);
}

export function isElastic(obj: ArmObj<Site>): boolean {
  const sku = obj.properties.sku && obj.properties.sku.toLocaleLowerCase();
  return sku === CommonConstants.SkuNames.elasticPremium || sku === CommonConstants.SkuNames.elasticIsolated;
}

export function isPremiumV2(obj: ArmObj<Site>): boolean {
  const sku = obj.properties.sku && obj.properties.sku.toLocaleLowerCase();
  return sku === CommonConstants.SkuNames.premiumV2;
}

export function mapResourcesTopologyToArmObjects<T>(columns: ResourceGraphColumn[], rows: any[][]): ArmObj<T>[] {
  const idIndex = columns.findIndex(col => col.name.toLowerCase() === 'id');
  const nameIndex = columns.findIndex(col => col.name.toLowerCase() === 'name');
  const typeIndex = columns.findIndex(col => col.name.toLowerCase() === 'type');
  const kindIndex = columns.findIndex(col => col.name.toLowerCase() === 'kind');
  const locationIndex = columns.findIndex(col => col.name.toLowerCase() === 'location');
  const propertiesIndex = columns.findIndex(col => col.name.toLowerCase() === 'properties');
  const identityIndex = columns.findIndex(col => col.name.toLowerCase() === 'identity');
  const skuIndex = columns.findIndex(col => col.name.toLowerCase() === 'sku');

  const armObjects: ArmObj<T>[] = rows.map(row => ({
    id: row[idIndex],
    name: row[nameIndex],
    type: row[typeIndex],
    kind: row[kindIndex],
    location: row[locationIndex],
    properties: row[propertiesIndex] as T,
    identity: row[identityIndex] as Identity,
    sku: row[skuIndex] as ArmSku,
  }));

  return armObjects;
}
