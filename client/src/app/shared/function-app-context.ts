import { ArmObj } from './models/arm/arm-obj';
import { Site } from './models/arm/site';
import { UrlTemplates } from './url-templates';

export interface FunctionAppContext {
    site: ArmObj<Site>;
    scmUrl: string;
    mainSiteUrl: string;
    urlTemplates: UrlTemplates;
    tryFunctionsScmCreds?: string;
    masterKey?: string;
}
