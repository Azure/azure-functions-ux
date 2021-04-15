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

  public static putStaticSite = (resourceId: string, body: any) => {
    return MakeArmCall<any>({
      resourceId,
      method: 'PUT',
      commandName: 'putStaticSite',
      body: body,
      apiVersion: CommonConstants.ApiVersions.staticSitePreviewApiVersion20191201,
    });
  };
}
