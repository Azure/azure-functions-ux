import SiteService from '../../../ApiHelpers/SiteService';
import TagsService from '../../../ApiHelpers/TagsService';
import { ISubscription } from '../../../models/subscription';
import { CommonConstants } from '../../../utils/CommonConstants';

export abstract class Dependency {
  public async updateTags(resourceId: string, resourceName: string, subscriptions?: ISubscription[]): Promise<string> {
    // Calls into discoverResourceId to get resourceId and sets it in Tags property for resource
    const acrInformation = await this.discoverResourceId(resourceName, subscriptions);
    if (!!acrInformation) {
      //call to tags
      const siteResponse = await SiteService.fetchSite(resourceId);
      if (siteResponse.metadata.success && !!siteResponse.data.tags) {
        let tags = siteResponse.data.tags;
        tags[this._getTagName(CommonConstants.DeploymentCenterACRTag, true)] = JSON.stringify(acrInformation);
        const update = await SiteService.updateSite(resourceId, siteResponse.data);
        if (!update.metadata.success) {
          //logError
        }
        return acrInformation.subscriptionId;
      } else if (!siteResponse.metadata.success) {
        //log error
      }
    }
    return '';
  }

  public async getTag(resourceId: string, tag: string, isTagHidden: boolean) {
    const tagName = this._getTagName(tag, isTagHidden);
    const site = await SiteService.fetchSite(resourceId);
    if (site.metadata.success && !!site.data.tags && !!site.data.tags[tagName]) {
      return site.data.tags[tagName];
    } else if (!site.metadata.success) {
      //log error
    }

    return undefined;
  }

  private _getTagName(tagName: string, isHidden: boolean) {
    return isHidden ? `hidden-link: ${tagName}` : tagName;
  }

  abstract discoverResourceId(resourceName: string, subscriptions?: ISubscription[]);
}

export class AppInsightsDependency extends Dependency {
  discoverResourceId(resourceName: string) {
    //TODO queries app settings and ARG to get resourceId and returns that to the parent
  }
}

export class AcrDependency extends Dependency {
  async discoverResourceId(resourceName: string, subscriptions: ISubscription[]) {
    // queries for ACR instance and returns resourceId
    const result = await TagsService.fetchAcrResourceId(resourceName, subscriptions);
    if (!!result && result.length > 0) {
      return result[0];
    } else {
      return undefined;
      //log error
    }
  }
}
