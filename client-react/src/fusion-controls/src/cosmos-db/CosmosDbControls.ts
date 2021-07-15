import FusionControls, { StandardArmRscTemplate } from '../common/FusionControls';

interface CosmosDbArmTemplate extends StandardArmRscTemplate {}
class CosmosDbControls extends FusionControls {
  cdbTemplate: CosmosDbArmTemplate;

  constructor() {
    super();
    this.cdbTemplate = this.template;

    // Set "default" values used in template
    this.template.type = 'Microsoft.DocumentDB/databaseAccounts';
    this.template.apiVersion = '2021-04-15';
    this.template.location = '[resourceGroup().location]';
    this.template.properties = {
      databaseAccountOfferType: 'Standard',
    };
  }
}

export default CosmosDbControls;
