import Url from './url';
import { LogEntryLevel } from '../models/portal-models';
import PortalCommunicator from '../portal-communicator';

export type LogLevelString = 'error' | 'warning' | 'debug' | 'verbose';

export default class LogService {
  private _logLevel: number;
  private _categories: string[];
  private _portalCommunicator: PortalCommunicator;

  constructor(portalCommunicator: PortalCommunicator) {
    this._portalCommunicator = portalCommunicator;
    const levelStr = Url.getParameterByName(null, 'appsvc.log.level');
    this._logLevel = this._getLogLevel(levelStr);
    this._categories = Url.getParameterArrayByName(null, 'appsvc.log.category');
  }

  public error(category: string, data: any, id?: string) {
    this._validateCategory(category);
    this._validateId(id);
    this._validateData(data);

    const errorId = `/errors/${category}/${id}`;

    // Always log errors to Ibiza logs
    this._portalCommunicator.logMessage(LogEntryLevel.Error, errorId, data);

    if (this._shouldLog(category, LogEntryLevel.Error)) {
      console.error(`[${category}] - ${data}`);
    }
  }

  public warn(category: string, data: any, id?: string) {
    this._validateCategory(category);
    this._validateId(id);
    this._validateData(data);

    const warningId = `/warnings/${category}/${id}`;

    // Always log warnings to Ibiza logs
    this._portalCommunicator.logMessage(LogEntryLevel.Warning, warningId, data);

    if (this._shouldLog(category, LogEntryLevel.Warning)) {
      console.log(`%c[${category}] - ${data}`, 'color: #ff8c00');
    }
  }

  public debug(category: string, data: any) {
    this._validateCategory(category);
    this._validateData(data);

    if (this._shouldLog(category, LogEntryLevel.Debug)) {
      console.log(`${this._getTime()} %c[${category}] - ${data}`, 'color: #0058ad');
    }
  }

  public verbose(category: string, data: any) {
    this._validateCategory(category);
    this._validateData(data);

    if (this._shouldLog(category, LogEntryLevel.Verbose)) {
      console.log(`${this._getTime()} [${category}] - ${data}`);
    }
  }

  public log(level: LogEntryLevel, category: string, data: any, id?: string) {
    if (level === LogEntryLevel.Error) {
      this.error(category, data, id);
    } else if (level === LogEntryLevel.Warning) {
      this.warn(category, data, id);
    } else if (level === LogEntryLevel.Debug) {
      this.debug(category, data);
    } else {
      this.verbose(category, data);
    }
  }

  private _getLogLevel(levelStr: string | null) {
    switch (levelStr) {
      case 'custom':
        return LogEntryLevel.Custom;
      case 'debug':
        return LogEntryLevel.Debug;
      case 'verbose':
        return LogEntryLevel.Verbose;
      case 'warning':
        return LogEntryLevel.Warning;
      case 'error':
        return LogEntryLevel.Error;
      default:
        return LogEntryLevel.Warning;
    }
  }
  private _shouldLog(category: string, logLevel: number) {
    if (logLevel <= this._logLevel) {
      if (logLevel === LogEntryLevel.Error || logLevel === LogEntryLevel.Warning) {
        return true;
      }

      if (this._categories.length > 0 && this._categories.find(c => c.toLowerCase() === category.toLowerCase())) {
        return true;
      }

      if (this._categories.length === 0) {
        return true;
      }

      return false;
    }

    return false;
  }

  private _getTime() {
    const now = new Date();
    return now.toISOString();
  }

  private _validateCategory(category?: string) {
    if (!category) {
      throw Error('You must provide a category');
    }
  }

  private _validateId(id?: string) {
    if (!id) {
      throw Error('You must provide an id');
    }
  }

  private _validateData(data?: any) {
    if (!data) {
      throw Error('You must provide data');
    }
  }
}
