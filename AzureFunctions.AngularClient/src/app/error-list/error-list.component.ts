import {FunctionsService} from './../shared/services/functions.service';
import {Component} from '@angular/core';
import {BroadcastService} from '../shared/services/broadcast.service';
import {BroadcastEvent} from '../shared/models/broadcast-event';
import {PortalService} from '../shared/services/portal.service';
import {ErrorItem} from '../shared/models/error-item';
import {ErrorEvent} from '../shared/models/error-event';
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
            let errorItem: ErrorItem;

            if (error && error.message && !error.message.startsWith('<!DOC')) {
                errorItem = { message: error.message, dateTime: new Date().toISOString(), date: new Date() };
                if (!this.errorList.find(e => e.message === errorItem.message)) {
                    this._aiService.trackEvent('/errors/portal', {
                        error: error.details,
                        message: error.message,
                        displayedGeneric: false.toString(),
                        appName: this._functionsService.getFunctionAppArmId()
                    });
                    this.errorList.push(errorItem);
                    this._functionsService.diagnose();
                }
            } else {
                if (error) {
                    this._aiService.trackEvent('/errors/portal', {
                        error: error.details,
                        appName: this._functionsService.getFunctionAppArmId(),
                        displayedGeneric: true.toString()
                    });
                } else {
                    this._aiService.trackEvent('/errors/portal', {
                        error: 'no error info',
                        appName: this._functionsService.getFunctionAppArmId(),
                        displayedGeneric: true.toString()
                    });
                }
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