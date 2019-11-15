import { AppKind } from './AppKind';
import { ArmObj } from '../models/arm-obj';
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
