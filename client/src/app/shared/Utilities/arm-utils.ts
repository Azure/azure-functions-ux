import { Injector } from '@angular/core/src/core';
import { UrlTemplates } from 'app/shared/url-templates';
import { FunctionAppContext } from './../function-app-context';
import { Site } from './../models/arm/site';
import { FunctionContainer } from './../models/function-container';
import { ArmObj, ResourceTopologyColumn, Identity, Sku } from './../models/arm/arm-obj';
import { Kinds } from '../models/constants';

export namespace ArmUtil {
  export function isFunctionApp(obj: ArmObj<any> | FunctionContainer): boolean {
    return (
      obj && (obj.kind && obj.kind.toLocaleLowerCase().includes(Kinds.functionApp) && !obj.kind.toLocaleLowerCase().includes(Kinds.botapp))
    );
  }

  export function isLinuxApp(obj: ArmObj<any> | FunctionContainer): boolean {
    return obj && obj.kind && obj.kind.toLocaleLowerCase().includes(Kinds.linux);
  }

  export function isContainerApp(obj: ArmObj<any> | FunctionContainer): boolean {
    return obj && obj.kind && obj.kind.toLocaleLowerCase().includes(Kinds.container);
  }

  export function isDynamic(obj: ArmObj<Site> | FunctionContainer) {
    return obj.properties.sku && obj.properties.sku.toLocaleLowerCase() === 'dynamic';
  }

  export function isLinuxDynamic(obj: ArmObj<Site> | FunctionContainer) {
    return isLinuxApp(obj) && isDynamic(obj);
  }

  export function isElastic(obj: ArmObj<Site>): boolean {
    const sku = obj.properties.sku && obj.properties.sku.toLocaleLowerCase();
    return sku === 'elasticpremium' || sku === 'elasticisolated';
  }

  export function isLinuxElastic(obj: ArmObj<Site>): boolean {
    return isLinuxApp(obj) && isElastic(obj);
  }

  export function mapArmSiteToContext(obj: ArmObj<Site>, injector: Injector): FunctionAppContext {
    const template = new UrlTemplates(obj, injector);
    return {
      site: obj,
      scmUrl: template.getScmUrl(),
      mainSiteUrl: template.getMainUrl(),
      urlTemplates: new UrlTemplates(obj, injector),
    };
  }

  export function mapResourcesTopologyToArmObjects<T>(columns: ResourceTopologyColumn[], rows: any[][]): ArmObj<T>[] {
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
      properties: <T>row[propertiesIndex],
      identity: <Identity>row[identityIndex],
      sku: <Sku>row[skuIndex],
    }));

    return armObjects;
  }
}
