import { Url } from './url';
import { LogEntryLevel } from '../models/portal-models';
import { PortalCommunicator } from '../portal-communicator';

export type LogLevelString = 'error' | 'warning' | 'debug' | 'verbose';

export class LogService {
  private _logLevel: LogEntryLevel;
  private _categories: string[];
  private _portalCommunicator: PortalCommunicator;

  constructor(portalCommunicator: PortalCommunicator) {
    this._portalCommunicator = portalCommunicator;
    const levelStr = Url.getParameterByName(null, 'appsvc.log.level');

    if (levelStr && LogEntryLevel[levelStr]) {
      this._logLevel = LogEntryLevel[levelStr];
    } else {
      this._logLevel = LogEntryLevel.Warning;
    }

    this._categories = Url.getParameterArrayByName(null, 'appsvc.log.category');
  }

  public error(category: string, id: string | undefined, data: any) {
    this.validateCategory(category);
    this.validateId(id);
    this.validateData(data);

    const errorId = `/errors/${category}/${id}`;

    // Always log errors to Ibiza logs
    this._portalCommunicator.logMessage(LogEntryLevel.Error, errorId, data);

    if (this.shouldLog(category, LogEntryLevel.Error)) {
      console.error(`[${category}] - ${data}`);
    }
  }

  public warn(category: string, id: string | undefined, data: any) {
    this.validateCategory(category);
    this.validateId(id);
    this.validateData(data);

    const warningId = `/warnings/${category}/${id}`;

    // Always log warnings to Ibiza logs
    this._portalCommunicator.logMessage(LogEntryLevel.Warning, warningId, data);

    if (this.shouldLog(category, LogEntryLevel.Warning)) {
      console.log(`%c[${category}] - ${data}`, 'color: #ff8c00');
    }
  }

  public debug(category: string, data: any) {
    this.validateCategory(category);
    this.validateData(data);

    if (this.shouldLog(category, LogEntryLevel.Debug)) {
      console.log(`${this.getTime()} %c[${category}] - ${data}`, 'color: #0058ad');
    }
  }

  public verbose(category: string, data: any) {
    this.validateCategory(category);
    this.validateData(data);

    if (this.shouldLog(category, LogEntryLevel.Verbose)) {
      console.log(`${this.getTime()} [${category}] - ${data}`);
    }
  }

  public log(level: LogEntryLevel, category: string, data: any, id?: string) {
    if (level === LogEntryLevel.Error) {
      this.error(category, id, data);
    } else if (level === LogEntryLevel.Warning) {
      this.warn(category, id, data);
    } else if (level === LogEntryLevel.Debug) {
      this.debug(category, data);
    } else {
      this.verbose(category, data);
    }
  }

  private shouldLog(category: string, logLevel: LogEntryLevel) {
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

  private getTime() {
    const now = new Date();
    return now.toISOString();
  }

  private validateCategory(category: string) {
    if (!category) {
      throw Error('You must provide a category');
    }
  }

  private validateId(id: string | undefined) {
    if (!id) {
      throw Error('You must provide a id');
    }
  }

  private validateData(data: any) {
    if (!data) {
      throw Error('You must provide a data');
    }
  }
}
