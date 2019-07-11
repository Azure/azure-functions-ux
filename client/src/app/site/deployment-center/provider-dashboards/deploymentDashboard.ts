import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from 'app/shared/models/portal-resources';
import { DeploymentData } from '../Models/deployment-data';

export class DeploymentDashboard {
  protected _deploymentFetchTries = 0;

  public tableMessages = {
    emptyMessage: this._translateService.instant(PortalResources.fetchingDeploymentData),
    totalMessage: '',
  };

  constructor(protected _translateService: TranslateService) {}

  protected _browseToSite(deploymentObject: DeploymentData) {
    if (deploymentObject && deploymentObject.site && deploymentObject.site.properties) {
      window.open(`https://${deploymentObject.site.properties.defaultHostName}`, '_blank');
    }
  }
}
