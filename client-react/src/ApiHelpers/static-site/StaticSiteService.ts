import MakeArmCall from '../ArmHelper';
import { ArmObj } from '../../models/arm-obj';
import { StaticSite } from '../../models/static-site/static-site';
import { CommonConstants } from '../../utils/CommonConstants';

export default class StaticSiteService {
  public static getStaticSite = (resourceId: string) => {
    return MakeArmCall<ArmObj<StaticSite>>({
      resourceId,
      commandName: 'getStaticSite',
      apiVersion: CommonConstants.ApiVersions.staticSitePreviewApiVersion20191201,
    });
  };

  public static patchStaticSite = (resourceId: string, body: any) => {
    return MakeArmCall<void>({
      resourceId,
      commandName: 'patchStaticSite',
      method: 'PATCH',
      body: body,
      apiVersion: CommonConstants.ApiVersions.staticSitePreviewApiVersion20191201,
    });
  };
}
