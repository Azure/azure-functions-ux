import { ArmObj, Site } from '../models/WebAppModels';
import { AppKind } from './AppKind';

export function isFunctionApp(obj: ArmObj<any>): boolean {
  return AppKind.hasKinds(obj, ['functionapp']) && !AppKind.hasKinds(obj, ['botapp']);
}

export function isLinuxApp(obj: ArmObj<any>): boolean {
  return AppKind.hasKinds(obj, ['linux']);
}

export function isLinuxDynamic(obj: ArmObj<Site>) {
  return isLinuxApp(obj) && !!obj.properties.sku && obj.properties.sku.toLocaleLowerCase() === 'dynamic';
}

export function isContainerApp(obj: ArmObj<Site>): boolean {
  return AppKind.hasKinds(obj, ['container']);
}
