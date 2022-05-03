import { CommonConstants } from '../../../../../../utils/CommonConstants';
import FusionControls from '../../../../../../utils/FusionControls';

class CosmosDbControls extends FusionControls {
  constructor() {
    super();

    this.template.type = CommonConstants.ResourceTypes.cosmosDbAccount;
    this.template.apiVersion = CommonConstants.ApiVersions.documentDBApiVersion20210415;
    this.template.location = '[resourceGroup().location]';
    this.template.properties = {
      databaseAccountOfferType: 'Standard',
    };
  }
}

export default CosmosDbControls;
