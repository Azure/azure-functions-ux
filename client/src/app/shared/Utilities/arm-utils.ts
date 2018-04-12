import { Injector } from '@angular/core/src/core';
import { UrlTemplates } from 'app/shared/url-templates';
import { FunctionAppContext } from './../function-app-context';
import { Site } from './../models/arm/site';
import { FunctionContainer } from './../models/function-container';
import { ArmObj } from './../models/arm/arm-obj';

export namespace ArmUtil {
    export function isFunctionApp(obj: ArmObj<any> | FunctionContainer): boolean {
        return obj &&
            (obj.kind &&
                obj.kind.toLocaleLowerCase().indexOf('functionapp') !== -1 &&
                obj.kind.toLocaleLowerCase().indexOf('botapp') === -1) ||
            (obj.name && obj.name.toLocaleLowerCase().startsWith('00fun'));
    }

    export function isLinuxApp(obj: ArmObj<any> | FunctionContainer): boolean {
        return obj &&
            obj.kind &&
            obj.kind.toLocaleLowerCase().indexOf('linux') !== -1;
    }

    export function isLinuxDynamic(obj: ArmObj<Site> | FunctionContainer) {
        return isLinuxApp(obj) &&
            obj.properties.sku &&
            obj.properties.sku.toLocaleLowerCase() === 'dynamic';
    }

    export function mapArmSiteToContext(obj: ArmObj<Site>, injector: Injector): FunctionAppContext {
        const template = new UrlTemplates(obj, injector);
        return {
            site: obj,
            scmUrl: template.getScmUrl(),
            mainSiteUrl: template.getMainUrl(),
            urlTemplates: new UrlTemplates(obj, injector)
        };
    }
}
