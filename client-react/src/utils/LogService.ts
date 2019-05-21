import Url from './url';
import { AppInsights } from 'applicationinsights-js';
export default class LogService {
  public static initialize() {
    if (process.env.REACT_APP_APPLICATION_INSIGHTS_KEY) {
      AppInsights.downloadAndSetup!({ instrumentationKey: process.env.REACT_APP_APPLICATION_INSIGHTS_KEY });

      AppInsights.queue.push(() => {
        AppInsights.context.application.ver = process.env.REACT_APP_APPLICATION_VERSION || '0.0.0';
        AppInsights.context.addTelemetryInitializer(envelope => {
          const telemetryItem = envelope.data.baseData;
          const sessionId = Url.getParameterByName(null, 'sessionId');
          const frameId = Url.getParameterByName(null, 'frameId');
          const shell = Url.getParameterByName(null, 'trustedAuthority');
          const currentPortal = Url.getHostName();
          telemetryItem.properties = telemetryItem.properties || {};
          telemetryItem.properties['sessionId'] = sessionId;
          telemetryItem.properties['frameId'] = frameId;
          telemetryItem.properties['shell'] = shell;
          telemetryItem.properties['currentPortal'] = currentPortal;
        });
      });
    }
  }

  public static error(category: string, id: string, data: any) {
    this._validateCategory(category);
    this._validateId(id);
    this._validateData(data);

    const errorId = `/errors/${category}/${id}`;

    if (AppInsights) {
      const properties = typeof data === 'object' ? data : { message: data };
      AppInsights.trackEvent(errorId, properties);
    }
    if (this._logToConsole) {
      console.error(`[${category}] - ${data}`);
    }
  }

  public static warn(category: string, id: string, data: any) {
    this._validateCategory(category);
    this._validateId(id);
    this._validateData(data);

    const warningId = `/warnings/${category}/${id}`;

    if (AppInsights) {
      const properties = typeof data === 'object' ? data : { message: data };
      AppInsights.trackEvent(warningId, properties);
    }
    if (this._logToConsole) {
      console.warn(`[${category}] - ${data}`);
    }
  }

  public static trackEvent(category: string, id: string, data: any) {
    this._validateCategory(category);
    this._validateId(id);
    this._validateData(data);

    const warningId = `/event/${category}/${id}`;

    if (AppInsights) {
      const properties = typeof data === 'object' ? data : { message: data };
      AppInsights.trackEvent(warningId, properties);
    }
    if (this._logToConsole) {
      console.log(`%c[${category}] - ${data}`, 'color: #ff8c00');
    }
  }

  public static startTrackPage(pageName: string) {
    if (AppInsights) {
      AppInsights.startTrackPage(pageName);
    }
    if (this._logToConsole) {
      console.log(`${this._getTime()} [Start Track Page] - ${pageName}`);
    }
  }

  public static stopTrackPage(pageName: string, data: any) {
    if (AppInsights) {
      AppInsights.stopTrackPage(pageName, window.location.href, data);
    }

    if (this._logToConsole) {
      console.log(`${this._getTime()} [Stop Track Page] - ${pageName}`);
    }
  }

  public static startTrackEvent(eventName: string) {
    if (AppInsights) {
      AppInsights.startTrackEvent(eventName);
    }
    if (this._logToConsole) {
      console.log(`${this._getTime()} [Start Track Event] - ${eventName}`);
    }
  }

  public static stopTrackEvent(eventName: string, data: any) {
    this._validateData(data);
    if (AppInsights) {
      AppInsights.stopTrackEvent(eventName, data);
    }
    if (this._logToConsole) {
      console.log(`${this._getTime()} [Stop Track Event] - ${eventName}`);
    }
  }

  public static debug(category: string, data: any) {
    this._validateCategory(category);
    this._validateData(data);

    if (this._logToConsole) {
      console.debug(`${this._getTime()} %c[${category}] - ${data}`);
    }
  }
  private static _logToConsole = process.env.NODE_ENV !== 'production';

  private static _getTime() {
    const now = new Date();
    return now.toISOString();
  }

  private static _validateCategory(category?: string) {
    if (!category) {
      throw Error('You must provide a category');
    }
  }

  private static _validateId(id?: string) {
    if (!id) {
      throw Error('You must provide an id');
    }
  }

  private static _validateData(data?: any) {
    if (!data) {
      throw Error('You must provide data');
    }
  }
}
