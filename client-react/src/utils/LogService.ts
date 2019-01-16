import { AppInsights as appInsights } from 'applicationinsights-js';

export default class LogService {
  private static _logToConsole = process.env.NODE_ENV !== 'production';

  public static error(category: string, id: string, data: any) {
    this._validateCategory(category);
    this._validateId(id);
    this._validateData(data);

    const errorId = `/errors/${category}/${id}`;

    if (appInsights) {
      appInsights.trackEvent(errorId, data);
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

    if (appInsights) {
      appInsights.trackEvent(warningId, data);
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

    if (appInsights) {
      appInsights.trackEvent(warningId, data);
    }
    if (this._logToConsole) {
      console.log(`%c[${category}] - ${data}`, 'color: #ff8c00');
    }
  }

  public static startTrackPage(pageName: string) {
    if (appInsights) {
      appInsights.startTrackPage(pageName);
    }
    if (this._logToConsole) {
      console.log(`${this._getTime()} [Start Track Page] - ${pageName}`);
    }
  }

  public static stopTrackPage(pageName: string, data: any) {
    if (appInsights) {
      appInsights.stopTrackPage(pageName, window.location.href, data);
    }

    if (this._logToConsole) {
      console.log(`${this._getTime()} [Stop Track Page] - ${pageName}`);
    }
  }

  public static startTrackEvent(eventName: string) {
    if (appInsights) {
      appInsights.startTrackPage(eventName);
    }
    if (this._logToConsole) {
      console.log(`${this._getTime()} [Start Track Event] - ${eventName}`);
    }
  }

  public static stopTrackEvent(eventName: string, data: any) {
    this._validateData(data);
    if (appInsights) {
      appInsights.stopTrackEvent(eventName, data);
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
