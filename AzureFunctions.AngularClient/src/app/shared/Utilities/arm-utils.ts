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

    export function mapArmSiteToContext(obj: ArmObj<Site>, isStandalone: boolean): FunctionAppContext {
        const getMainUrl = (site: ArmObj<Site>) => {
            if (isStandalone) {
                return `https://${site.properties.defaultHostName}/functions/${site.name}`;
            } else {
                return `https://${site.properties.defaultHostName}`;
            }
        };

        const getScmUrl = (site: ArmObj<Site>) => {
            if (isStandalone) {
                return getMainUrl(site);
            } else {
                return `https://${site.properties.hostNameSslStates.find(s => s.hostType === 1).name}`;
            }
        };

        const scmUrl = getScmUrl(obj);
        const mainSiteUrl = getMainUrl(obj);
        return {
            site: obj,
            scmUrl: scmUrl,
            mainSiteUrl: mainSiteUrl,
            urlTemplates: new UrlTemplates(scmUrl, mainSiteUrl, ArmUtil.isLinuxApp(obj))
        };

    }
}
