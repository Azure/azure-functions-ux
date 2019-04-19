import { Injector } from '@angular/core/src/core';
import { UrlTemplates } from 'app/shared/url-templates';
import { FunctionAppContext } from './../function-app-context';
import { Site } from './../models/arm/site';
import { FunctionContainer } from './../models/function-container';
import { ArmObj } from './../models/arm/arm-obj';
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
  export function isLinuxDynamic(obj: ArmObj<Site> | FunctionContainer) {
    return isLinuxApp(obj) && obj.properties.sku && obj.properties.sku.toLocaleLowerCase() === 'dynamic';
  }

  export function isElastic(obj: ArmObj<Site>): boolean {
    const sku = obj.properties.sku && obj.properties.sku.toLocaleLowerCase();
    return sku === 'elasticpremium' || sku === 'elasticisolated';
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
}
