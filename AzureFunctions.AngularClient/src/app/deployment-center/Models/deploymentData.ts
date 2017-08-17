import { SiteConfig } from '../../shared/models/arm/site-config';
import { Site } from '../../shared/models/arm/site';
import { ArmObj } from '../../shared/models/arm/arm-obj';
export interface DeploymentData
{
    site: ArmObj<Site>;
    siteConfig: ArmObj<SiteConfig>;
    siteMetadata: ArmObj<any>;
    deployments: ArmObj<any>;
    publishingCredentials: ArmObj<any>;
    sourceControls: ArmObj<any>;
}