import { ArmObj, Site } from '../models/WebAppModels';
export function isFunctionApp(obj: ArmObj<any>): boolean {
  return !!obj.kind && obj.kind.toLocaleLowerCase().indexOf('functionapp') !== -1 && obj.kind.toLocaleLowerCase().indexOf('botapp') === -1;
}

export function isLinuxApp(obj: ArmObj<any>): boolean {
  return !!obj && !!obj.kind && obj.kind.toLocaleLowerCase().indexOf('linux') !== -1;
}

export function isLinuxDynamic(obj: ArmObj<Site>) {
  return isLinuxApp(obj) && !!obj.properties.sku && obj.properties.sku.toLocaleLowerCase() === 'dynamic';
}

export function isContainerApp(obj: ArmObj<Site>): boolean {
  return !!obj && !!obj.kind && obj.kind.toLocaleLowerCase().includes('container');
}
