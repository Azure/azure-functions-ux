import { Injector } from '@angular/core/src/core';
import { UrlTemplates } from 'app/shared/url-templates';
import { FunctionAppContext } from './../function-app-context';
import { Site } from './../models/arm/site';
import { FunctionContainer } from './../models/function-container';
import { ArmObj, ResourceTopologyColumn, Identity, Sku } from './../models/arm/arm-obj';
import { FeatureFlags, Kinds } from '../models/constants';
import { AppKind } from './app-kind';
import { Url } from './url';
import { NationalCloudEnvironment } from '../services/scenario/national-cloud.environment';

export namespace ArmUtil {
  export function isFunctionApp(obj: ArmObj<any> | FunctionContainer): boolean {
    return obj && AppKind.hasKinds(obj, [Kinds.functionApp]) && !AppKind.hasKinds(obj, [Kinds.botapp]);
  }

  export function isLinuxApp(obj: ArmObj<any> | FunctionContainer): boolean {
    // NOTE(andimarc): For kube apps 'linux' doesn't currently get added to the kind.
    // However kube apps only support linux so we can treat all kube apps as linux apps.
    // BUG - https://msazure.visualstudio.com/Antares/_workitems/edit/9321559
    return (obj && AppKind.hasKinds(obj, [Kinds.linux])) || isKubeApp(obj);
  }

  export function isContainerApp(obj: ArmObj<any> | FunctionContainer): boolean {
    return obj && AppKind.hasKinds(obj, [Kinds.container]);
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

  export function isKubeApp(obj: ArmObj<Site> | FunctionContainer): boolean {
    // NOTE(michinoy): While there is a bug in place, we can pass in a flag in the
    // url to treat the app as Kube app.
    // BUG - https://msazure.visualstudio.com/Antares/_workitems/edit/9449377
    // NOTE(andimarc): This 'kubeapp' kind will be changing to 'kubernetes', so we're
    // temporarily checking for both in order to gracefully handle the transition.
    return (
      (obj && AppKind.hasAnyKind(obj, [Kinds.kubeApp, Kinds.kubernetes])) || Url.getFeatureValue(FeatureFlags.treatAsKubeApp) === 'true'
    );
  }

  export function isASEV3GenerallyAccessible(): boolean {
    // NOTE(miabebax): ASEv3 is available in Public, Fairfax and USSec environment only.
    // We use this helper function to decide whether we display ASEv3 or ASEv2 features.
    // Ex: In spec picker blade, we hide isolatedV2 specs if it is not ASEv3 supported regions.
    return !NationalCloudEnvironment.isNationalCloud() || NationalCloudEnvironment.isFairFax() || NationalCloudEnvironment.isUSSec();
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
