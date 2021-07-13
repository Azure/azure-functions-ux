import ILogEvent from '../common/utils/ILogEvent';

// Declaring appsvc property on window (extended from Ibiza/Fusion)
declare global {
  interface Window {
    appsvc?: any;
  }
}

window.appsvc = window.appsvc || {};

export interface StandardArmRscTemplate {
  apiVersion: string;
  type: string;
  kind: string;
  name: string;
  location: string;
  properties: {
    [key: string]: any;
  };
}

class FusionControls {
  template: StandardArmRscTemplate;
  static AppSvc = window.appsvc;

  constructor() {
    this.template = {
      apiVersion: '',
      type: '',
      kind: '',
      name: '',
      location: '',
      properties: {},
    };
  }

  static logEvent = (event: ILogEvent) => {
    const { category, id, data } = event;
    if (FusionControls.AppSvc.logging) {
      FusionControls.AppSvc.logging.trackEvent(category, id, data);
    }
  };

  static logError = (error: ILogEvent) => {
    const { category, id, data } = error;
    if (FusionControls.AppSvc.logging) {
      FusionControls.AppSvc.logging.trackError(category, id, data);
    }
  };

  createTemplateJSON = () => JSON.stringify(this.template);
}

export default FusionControls;
