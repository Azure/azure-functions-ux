import SiteService from '../../ApiHelpers/SiteService';
import TagsService from '../../ApiHelpers/TagsService';
import { KeyValue } from '../../models/portal-models';
import PortalCommunicator from '../../portal-communicator';
import { CommonConstants } from '../CommonConstants';
import { getTelemetryInfo } from '../../pages/app/deployment-center/utility/DeploymentCenterUtility';

export abstract class Dependency {
  public async updateTags(portalContext: PortalCommunicator, resourceId: string, resourceName: string): Promise<string> {
    // Calls into discoverResourceId to get resourceId and sets it in Tags property for resource
    const tagInformation = await this.discoverResourceId(portalContext, resourceName);
    return this.updateId(portalContext, resourceId, tagInformation);
  }

  public async deleteTag(portalContext: PortalCommunicator, resourceId: string) {
    return await this.deleteId(portalContext, resourceId);
  }

  public async getTag(portalContext: PortalCommunicator, resourceId: string, tag: string, isTagHidden: boolean) {
    const tagName = this._getTagName(tag, isTagHidden);
    const site = await SiteService.fetchSite(resourceId);
    if (site.metadata.success) {
      if (!!site.data.tags && !!site.data.tags[tagName]) {
        return site.data.tags[tagName];
      }
    } else {
      portalContext.log(
        getTelemetryInfo('error', 'getSite', 'failed', {
          error: site.metadata.error,
        })
      );
    }

    return undefined;
  }

  protected _getTagName(tagName: string, isHidden: boolean) {
    return isHidden ? `${CommonConstants.hiddenLink}: ${tagName}` : tagName;
  }

  abstract discoverResourceId(portalContext: PortalCommunicator, resourceName: string);

  abstract updateId(portalContext: PortalCommunicator, resourceId: string, tagInformation: any);

  abstract deleteId(portalContext: PortalCommunicator, resourceId: string);
}

export class AcrDependency extends Dependency {
  async discoverResourceId(portalContext: PortalCommunicator, resourceName: string) {
    // queries for ACR instance and returns resourceId
    const result = await TagsService.fetchAcrResourceId(resourceName);
    if (result) {
      if (result.length > 0) {
        return result[0];
      }
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
        acrTag[this._getTagName(CommonConstants.DeploymentCenterConstants.acrTag, true)] = JSON.stringify(acrResourceJson);
        siteResponse.data.tags = { ...siteResponse.data.tags, ...acrTag };
        const updateTagsResponse = await SiteService.updateSite(resourceId, siteResponse.data, undefined, true);
        if (updateTagsResponse.metadata.success) {
          return tagInformation.subscriptionId;
        }
      } else if (!siteResponse.metadata.success) {
        portalContext.log(
          getTelemetryInfo('error', 'updateAcrHiddenTag', 'failed', {
            error: siteResponse.metadata.error,
          })
        );
      }
    }
  }

  async deleteId(portalContext: PortalCommunicator, resourceId: string) {
    const siteResponse = await SiteService.fetchSite(resourceId);
    if (siteResponse.metadata.success) {
      const tags = siteResponse.data.tags;
      if (tags) {
        delete tags[this._getTagName(CommonConstants.DeploymentCenterConstants.acrTag, true)];
        const deleteTagResponse = await SiteService.updateSite(resourceId, siteResponse.data, undefined, true);
        if (!deleteTagResponse.metadata.success) {
          portalContext.log(
            getTelemetryInfo('error', 'deleteAcrHiddenTag', 'failed', {
              error: siteResponse.metadata.error,
            })
          );
        }
      }
    } else {
      portalContext.log(
        getTelemetryInfo('error', 'fetchSiteForDeleteId', 'failed', {
          error: siteResponse.metadata.error,
        })
      );
    }
  }
}
