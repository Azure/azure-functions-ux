export interface StandardArmResourceTemplate {
  apiVersion: string;
  kind?: string;
  location: string;
  name: string;
  properties: Record<string, unknown>;
  sku?: Record<string, unknown>;
  type: string;
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
