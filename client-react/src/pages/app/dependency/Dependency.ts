import SiteService from '../../../ApiHelpers/SiteService';
import TagsService from '../../../ApiHelpers/TagsService';
import { KeyValue } from '../../../models/portal-models';
import { ISubscription } from '../../../models/subscription';
import PortalCommunicator from '../../../portal-communicator';
import { CommonConstants } from '../../../utils/CommonConstants';
import { getTelemetryInfo } from '../deployment-center/utility/DeploymentCenterUtility';

export abstract class Dependency {
  public async updateTags(
    portalContext: PortalCommunicator,
    resourceId: string,
    resourceName: string,
    subscriptions?: ISubscription[]
  ): Promise<string> {
    // Calls into discoverResourceId to get resourceId and sets it in Tags property for resource
    const tagInformation = await this.discoverResourceId(portalContext, resourceName, subscriptions);
    return this.updateId(portalContext, resourceId, tagInformation);
  }

  public async getTag(portalContext: PortalCommunicator, resourceId: string, tag: string, isTagHidden: boolean) {
    const tagName = this._getTagName(tag, isTagHidden);
    const site = await SiteService.fetchSite(resourceId);
    if (site.metadata.success && !!site.data.tags && !!site.data.tags[tagName]) {
      return site.data.tags[tagName];
    } else if (!site.metadata.success) {
      portalContext.log(
        getTelemetryInfo('error', 'getSite', 'failed', {
          error: site.metadata.error,
        })
      );
    }

    return undefined;
  }

  protected _getTagName(tagName: string, isHidden: boolean) {
    return isHidden ? `hidden-link: ${tagName}` : tagName;
  }

  abstract discoverResourceId(portalContext: PortalCommunicator, resourceName: string, subscriptions?: ISubscription[]);

  abstract updateId(portalContext: PortalCommunicator, resourceId: string, tagInformation: any);
}

export class AcrDependency extends Dependency {
  async discoverResourceId(portalContext: PortalCommunicator, resourceName: string, subscriptions: ISubscription[]) {
    // queries for ACR instance and returns resourceId
    const result = await TagsService.fetchAcrResourceId(resourceName, subscriptions);
    if (!!result && result.length > 0) {
      return result[0];
    } else {
      portalContext.log(
        getTelemetryInfo('error', 'getAcrResourceId', 'failed', {
          error: result,
        })
      );
      return undefined;
    }
  }

  async updateId(portalContext: PortalCommunicator, resourceId: string, tagInformation: any) {
    if (!!tagInformation && tagInformation.id) {
      const siteResponse = await SiteService.fetchSite(resourceId);
      if (siteResponse.metadata.success) {
        const acrResourceJson = {
          resourceId: tagInformation.id,
          subscriptionId: tagInformation.subscriptionId,
        };

        const acrTag: KeyValue<string> = {};
        acrTag[this._getTagName(CommonConstants.DeploymentCenterACRTag, true)] = JSON.stringify(acrResourceJson);
        siteResponse.data.tags = { ...siteResponse.data.tags, ...acrTag };

        const update = await SiteService.updateSite(resourceId, siteResponse.data);
        if (!update.metadata.success) {
          portalContext.log(
            getTelemetryInfo('error', 'getAcrResourceId', 'failed', {
              error: update.metadata.error,
            })
          );
        }
        return tagInformation.subscriptionId;
      } else if (!siteResponse.metadata.success) {
        portalContext.log(
          getTelemetryInfo('error', 'getAcrResourceId', 'failed', {
            error: siteResponse.metadata.error,
          })
        );
      }
    }
  }
}
