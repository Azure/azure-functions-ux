export interface StandardArmResourceTemplate {
  apiVersion: string;
  location: string;
  name: string;
  properties: Record<string, unknown>;
  type: string;
  kind?: string;
  sku?: Record<string, unknown>;
}

class FusionControls {
  public template: StandardArmResourceTemplate;

  constructor() {
    this.template = {
      apiVersion: '',
      kind: '',
      location: '',
      name: '',
      properties: {},
      type: '',
    };
  }

  public createTemplateJSON(): string {
    return JSON.stringify(this.template);
  }
}

export default FusionControls;
