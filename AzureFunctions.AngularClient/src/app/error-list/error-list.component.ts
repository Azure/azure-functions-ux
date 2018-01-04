import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AiService } from '../shared/services/ai.service';
import { BroadcastService } from '../shared/services/broadcast.service';
import { BroadcastEvent } from '../shared/models/broadcast-event';
import { PortalService } from '../shared/services/portal.service';
import { ErrorItem } from '../shared/models/error-item';
import { ErrorEvent } from '../shared/models/error-event';

@Component({
    selector: 'error-list',
    templateUrl: './error-list.component.html',
    styleUrls: ['./error-list.component.css']
})
export class ErrorListComponent {
    public errorList: ErrorItem[];
    // TODO: _portalService is used in the view to get sessionId. Change this when sessionId is observable.
    constructor(_broadcastService: BroadcastService,
        public _portalService: PortalService,
        private _aiService: AiService) {
        this.errorList = [];

        _broadcastService.subscribe<ErrorEvent>(BroadcastEvent.Error, (error) => {
            if (error && error.message && !error.message.startsWith('<!DOC')) {
                const errorItem: ErrorItem = {
                    message: error.message,
                    dateTime: new Date().toISOString(),
                    date: new Date(),
                    errorIds: [error.errorId],
                    dismissable: true
                };
                const existingError = this.errorList.find(e => e.message === errorItem.message);
                if (existingError && !existingError.errorIds.find(e => e === error.errorId)) {
                    existingError.errorIds.push(error.errorId);
                } else if (!existingError) {
                    this.errorList.push(errorItem);
                    if (this.errorList.find(e => e === errorItem)) {
                        this._aiService.trackEvent('/errors/portal/visibleError', {
                            error: error.message,
                            message: error.message,
                            errorId: error.errorId,
                            displayedGeneric: false.toString(),
                            appName: error.resourceId
                        });
                    }
                }
            } else {
                if (error) {
                    this._aiService.trackEvent('/errors/portal/unknown', {
                        error: error.message,
                        appName: error.resourceId,
                        displayedGeneric: true.toString()
                    });
                } else {
                    this._aiService.trackEvent('/errors/portal/unknown', {
                        error: 'no error info',
                        appName: error.resourceId,
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
                });
            }
        });

        Observable.timer(1, 60000)
            .subscribe(_ => {
                const cutOffTime = new Date();
                cutOffTime.setMinutes(cutOffTime.getMinutes() - 10);
                this.errorList = this.errorList.filter(e => e.date > cutOffTime);
            });
    }

    dismissError(index: number) {
        this.errorList.splice(index, 1);
    }
}
