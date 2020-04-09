import { AiService } from 'app/shared/services/ai.service';
import { Injectable } from '@angular/core';
import { Url } from 'app/shared/Utilities/url';

export enum LogLevel {
  error,
  warning,
  debug,
  verbose,
  trace,
}

export type LogLevelString = 'error' | 'warning' | 'debug' | 'verbose';

@Injectable()
export class LogService {
  private _logLevel: LogLevel;
  private _categories: string[];

  constructor(private _aiService: AiService) {
    const levelStr = Url.getParameterByName(null, 'appsvc.log.level');

    if (levelStr) {
      try {
        this._logLevel = LogLevel[levelStr];
      } catch (e) {
        this._logLevel = LogLevel.warning;
      }
    } else {
      this._logLevel = LogLevel.warning;
    }

    this._categories = Url.getParameterArrayByName(null, 'appsvc.log.category');
  }

  public trace(category: string, id: string, data?: any) {
    if (!category || !id) {
      throw Error('You must provide a category and id');
    }

    // Always log traces to App Insights
    const properties = data ? (typeof data === 'object' ? data : { message: data }) : null;
    this._aiService.trackEvent(`/trace/${category}/${id}`, properties);

    if (this._shouldLog(category, LogLevel.trace)) {
      console.error(`[${category}] - ${this._getDataString(data)}`);
    }
  }

  public error(category: string, id: string, data: any) {
    if (!category || !id || !data) {
      throw Error('You must provide a category, id, and data');
    }

    const errorId = `/errors/${category}/${id}`;

    // Always log errors to App Insights
    const properties = typeof data === 'object' ? data : { message: data };
    this._aiService.trackEvent(errorId, properties);

    if (this._shouldLog(category, LogLevel.error)) {
      console.error(`[${category}] - ${this._getDataString(data)}`);
    }
  }

  public warn(category: string, id: string, data: any) {
    if (!category || !id || !data) {
      throw Error('You must provide a category, id, and data');
    }

    const warningId = `/warnings/${category}/${id}`;

    // Always log warnings to App Insights
    const properties = typeof data === 'object' ? data : { message: data };
    this._aiService.trackEvent(warningId, properties);

    if (this._shouldLog(category, LogLevel.warning)) {
      console.log(`%c[${category}] - ${this._getDataString(data)}`, 'color: #ff8c00');
    }
  }

  public debug(category: string, data: any) {
    if (!category || !data) {
      throw Error('You must provide a category and data');
    }

    if (this._shouldLog(category, LogLevel.debug)) {
      console.log(`${this._getTime()} %c[${category}] - ${this._getDataString(data)}`, 'color: #0058ad');
    }
  }

  public verbose(category: string, data: any) {
    if (!category || !data) {
      throw Error('You must provide a category and data');
    }

    if (this._shouldLog(category, LogLevel.verbose)) {
      console.log(`${this._getTime()} [${category}] - ${this._getDataString(data)}`);
    }
  }

  public log(level: LogLevel, category: string, data: any, id?: string) {
    if (!id && (level === LogLevel.error || level === LogLevel.warning)) {
      throw Error('Error and Warning log levels require an id');
    }

    if (level === LogLevel.error) {
      this.error(category, id, data);
    } else if (level === LogLevel.warning) {
      this.warn(category, id, data);
    } else if (level === LogLevel.debug) {
      this.debug(category, data);
    } else {
      this.verbose(category, data);
    }
  }

  private _shouldLog(category: string, logLevel: LogLevel) {
    if (logLevel <= this._logLevel) {
      if (logLevel === LogLevel.error || logLevel === LogLevel.warning) {
        return true;
      } else if (this._categories.length > 0 && this._categories.find(c => c.toLowerCase() === category.toLowerCase())) {
        return true;
      } else if (this._categories.length === 0) {
        return true;
      } else {
        return false;
      }
    }

    return false;
  }

  private _getDataString(data: any): string {
    return typeof data === 'string' ? data : JSON.stringify(data);
  }

  private _getTime() {
    const now = new Date();
    return now.toISOString();
  }
}
