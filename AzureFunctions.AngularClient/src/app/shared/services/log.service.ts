import { AiService } from 'app/shared/services/ai.service';
import { Injectable } from '@angular/core';
import { Url } from 'app/shared/Utilities/url';

enum LogLevel {
    error,
    warning,
    debug,
    verbose
}

@Injectable()
export class LogService {

    // static debugging: any; boolean = (Url.getParameterByName(null, "appsvc.log") === 'debug');
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

    // TODO: Should we enforce that data is a standard generic object type?  It would make simple
    // logging more complicated, but may help to promote better data being logged.
    public error(category: string, id: string, data: any) {
        if (!category || !id || !data) {
            throw Error('You must provide a category, id, and data');
        }

        const errorId = `/errors${id}`;

        // Always log errors to App Insights
        this._aiService.trackEvent(errorId, data);

        if (this._shouldLog(category, LogLevel.error)) {
            console.error(`[${category}] - ${data}`);
        }
    }

    public warn(category: string, id: string, data: any) {
        if (!category || !id || !data) {
            throw Error('You must provide a category, id, and data');
        }

        const warningId = `/warnings${id}`;

        // Always log warnings to App Insights
        this._aiService.trackEvent(warningId, data);

        if (this._shouldLog(category, LogLevel.warning)) {
            console.log(`%c[${category}] - ${data}`, 'color: #ff8c00');
        }
    }

    public debug(category: string, data: any) {
        if (!category || !data) {
            throw Error('You must provide a category and data');
        }

        if (this._shouldLog(category, LogLevel.debug)) {
            console.log(`%c[${category}] - ${data}`, 'color: #0058ad');
        }
    }

    public verbose(category: string, data: any) {
        if (!category || !data) {
            throw Error('You must provide a category and data');
        }

        if (this._shouldLog(category, LogLevel.verbose)) {
            console.log(`[${category}] - ${data}`);
        }
    }

    private _shouldLog(category: string, logLevel: LogLevel) {

        if (logLevel <= this._logLevel) {
            if (this._categories.length > 0 && this._categories.find(c => c.toLowerCase() === category.toLowerCase())) {
                return true;
            } else if (this._categories.length === 0) {
                return true;
            } else {
                return false;
            }
        }

        return false;
    }
}