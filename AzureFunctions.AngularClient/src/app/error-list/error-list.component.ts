import {FunctionsService} from './../shared/services/functions.service';
import {Component} from '@angular/core';
import {BroadcastService} from '../shared/services/broadcast.service';
import {BroadcastEvent} from '../shared/models/broadcast-event';
import {PortalService} from '../shared/services/portal.service';
import {ErrorItem} from '../shared/models/error-item';
import { ErrorEvent, ErrorType } from '../shared/models/error-event';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../shared/models/portal-resources';
import {AiService} from '../shared/services/ai.service';
import {Observable} from 'rxjs/Rx';

@Component({
  selector: 'error-list',
  templateUrl: './error-list.component.html',
  styleUrls: ['./error-list.component.css']
})
export class ErrorListComponent {
    public errorList: ErrorItem[];
    // TODO: _portalService is used in the view to get sessionId. Change this when sessionId is observable.
    constructor(private _broadcastService: BroadcastService,
        public _portalService: PortalService,
        private _translateService: TranslateService,
        private _aiService: AiService,
        private _functionsService: FunctionsService) {
        this.errorList = [];

        _broadcastService.subscribe<ErrorEvent>(BroadcastEvent.Error, (error) => {
            if (error && error.message && !error.message.startsWith('<!DOC')) {
                let errorItem: ErrorItem = {
                    message: error.message,
                    dateTime: new Date().toISOString(),
                    date: new Date(),
                    errorType: error.errorType,
                    errorIds: [error.errorId],
                    dismissable: error.errorType !== ErrorType.Fatal
                };
                let existingError = this.errorList.find(e => e.message === errorItem.message);
                if (existingError && !existingError.errorIds.find(e => e === error.errorId)) {
                    existingError.errorIds.push(error.errorId);
                } else if (!existingError) {
                    this.errorList.push(errorItem);
                    if (this.errorList.find(e => e.errorType === ErrorType.Fatal)) {
                        this.errorList = this.errorList.filter(e => e.errorType === ErrorType.Fatal);
                    }
                    if (this.errorList.find(e => e === errorItem)) {
                        this._aiService.trackEvent('/errors/portal/visibleError', {
                            error: error.details,
                            message: error.message,
                            errorId: error.errorId,
                            displayedGeneric: false.toString(),
                            appName: this._functionsService.getFunctionAppArmId()
                        });
                    }
                }
            } else {
                if (error) {
                    this._aiService.trackEvent('/errors/portal/unknown', {
                        error: error.details,
                        appName: this._functionsService.getFunctionAppArmId(),
                        displayedGeneric: true.toString()
                    });
                } else {
                    this._aiService.trackEvent('/errors/portal/unknown', {
                        error: 'no error info',
                        appName: this._functionsService.getFunctionAppArmId(),
                        displayedGeneric: true.toString()
                    });
                }
            }
        });

        _broadcastService.subscribe<string>(BroadcastEvent.ClearError, errorId => {
            for (let i = 0; i < this.errorList.length; i++) {
                this.errorList[i].errorIds = this.errorList[i].errorIds.filter(e => e !== errorId);
            }
            if (this.errorList.find(e => e.errorIds.length === 0)) {
                this.errorList = this.errorList.filter(e => e.errorIds.length !== 0);
                this._aiService.trackEvent('/errors/auto-cleared', {
                    errorId: errorId,
                    appName: this._functionsService.getFunctionAppArmId()
                });
            }
        });

        Observable.timer(1, 60000)
            .subscribe(_ => {
                let cutOffTime = new Date();
                cutOffTime.setMinutes(cutOffTime.getMinutes() - 10);
                this.errorList = this.errorList.filter(e => e.date > cutOffTime);
            });
    }

    dismissError(index: number) {
        this.errorList.splice(index, 1);
    }
}
