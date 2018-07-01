import { Directive, Input, SimpleChange, OnChanges } from '@angular/core';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/switchMap';
import { LogService, LogLevel, LogLevelString } from 'app/shared/services/log.service';


@Directive({
    selector: '[log-message]',
})
export class LogMessageDirective implements OnChanges {

    @Input('log-message') message: string;
    @Input('log-level') level: LogLevelString = 'verbose';
    @Input('log-category') category: string;

    constructor(
        private _logService: LogService) {
    }

    ngOnChanges(changes: { [key: string]: SimpleChange }) {
        if(!this.category || !this.message){
            throw Error("message and category are required");
        }

        this._logService.log(LogLevel[this.level], this.category, this.message);
    }
}
