import { AppKind } from './AppKind';
import { ArmObj, ResourceGraphColumn, Identity, ArmSku } from '../models/arm-obj';
import { Site } from '../models/site/site';
import { CommonConstants } from './CommonConstants';
import Url from './url';
import { ArmSubcriptionDescriptor } from './resourceDescriptors';

export function isFunctionApp(obj: ArmObj<any>): boolean {
  return AppKind.hasKinds(obj, [CommonConstants.Kinds.functionApp]) && !AppKind.hasKinds(obj, [CommonConstants.Kinds.botapp]);
}

export function isLinuxApp(obj: ArmObj<any>): boolean {
  // NOTE(andimarc): For kube apps 'linux' doesn't currently get added to the kind.
  // However kube apps only support linux so we can treat all kube apps as linux apps.
  // BUG - https://msazure.visualstudio.com/Antares/_workitems/edit/9321559
  return AppKind.hasKinds(obj, [CommonConstants.Kinds.linux]) || isKubeApp(obj);
}

export function isWindowsCode(obj: ArmObj<Site>): boolean {
  const kind = obj.kind ? obj.kind.toLowerCase() : '';
  return kind === CommonConstants.Kinds.app || kind === CommonConstants.Kinds.api;
}

export function isLinuxDynamic(obj: ArmObj<Site>) {
  return isLinuxApp(obj) && isDynamic(obj);
}

export function isContainerApp(obj: ArmObj<Site>): boolean {
  return AppKind.hasKinds(obj, [CommonConstants.Kinds.container]);
}

export function isContainerAppEnvironmentApp(obj: ArmObj<Site>): boolean {
  return AppKind.hasKinds(obj, [CommonConstants.Kinds.azureContainerApps]);
}

export function isElastic(obj: ArmObj<Site>): boolean {
  const sku = obj.properties.sku && obj.properties.sku.toLocaleLowerCase();
  return sku === CommonConstants.SkuNames.elasticPremium || sku === CommonConstants.SkuNames.elasticIsolated;
}

export function isElasticPremium(obj: ArmObj<Site>): boolean {
  // This sku is only for function apps
  const sku = obj.properties.sku && obj.properties.sku.toLocaleLowerCase();
  return sku === CommonConstants.SkuNames.elasticPremium;
}

export function isLinuxElastic(obj: ArmObj<Site>) {
  return isLinuxApp(obj) && isElastic(obj);
}

export function isPremiumV2(obj: ArmObj<Site>): boolean {
  const sku = obj.properties.sku && obj.properties.sku.toLocaleLowerCase();
  return sku === CommonConstants.SkuNames.premiumV2;
}

export function isPremiumV1(obj: ArmObj<Site>): boolean {
  const sku = obj?.properties?.sku?.toLocaleLowerCase();
  return sku === CommonConstants.SkuNames.premium;
}

export function isPremiumV3(obj: ArmObj<Site>): boolean {
  const sku = obj?.properties?.sku?.toLocaleLowerCase();
  return sku === CommonConstants.SkuNames.premiumV3;
}

export function isPremium0V3(obj: ArmObj<Site>): boolean {
  const sku = obj?.properties?.sku?.toLocaleLowerCase();
  return sku === CommonConstants.SkuNames.premium0V3;
}

export function isPremiumMV3(obj: ArmObj<Site>): boolean {
  const sku = obj?.properties?.sku?.toLocaleLowerCase();
  return sku === CommonConstants.SkuNames.premiumMV3;
}

export function isPremium(obj: ArmObj<Site>): boolean {
  return isPremiumV1(obj) || isPremiumV2(obj) || isPremiumV3(obj) || isPremium0V3(obj) || isPremiumMV3(obj);
}

export function isXenonApp(obj: ArmObj<Site>): boolean {
  return AppKind.hasKinds(obj, [CommonConstants.Kinds.xenon]);
}

export function isWorkflowApp(obj: ArmObj<any>): boolean {
  return AppKind.hasKinds(obj, [CommonConstants.Kinds.functionApp, CommonConstants.Kinds.workflowApp]);
}

export function isKubeApp(obj: ArmObj<unknown>): boolean {
  // NOTE(michinoy): While there is a bug in place, we can pass in a flag in the
  // url to treat the app as Kube app.
  // BUG - https://msazure.visualstudio.com/Antares/_workitems/edit/9449377
  // NOTE(andimarc): This 'kubeapp' kind will be changing to 'kubernetes', so we're
  // temporarily checking for both in order to gracefully handle the transition.
  return (
    AppKind.hasAnyKind(obj, [CommonConstants.Kinds.kubeApp, CommonConstants.Kinds.kubernetes]) ||
    Url.getFeatureValue(CommonConstants.FeatureFlags.treatAsKubeApp) === 'true'
  );
}

export function isDynamic(obj: ArmObj<Site>) {
  return !!obj.properties.sku && obj.properties.sku.toLocaleLowerCase() === CommonConstants.SkuNames.dynamic;
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

export function getSubscriptionFromResourceId(resourceId: string) {
  const armResourceDescriptor = new ArmSubcriptionDescriptor(resourceId);
  return armResourceDescriptor.getSubsriptionId();
}
