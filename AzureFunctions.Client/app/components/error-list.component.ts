import {Component} from '@angular/core';
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'
import {PortalService} from '../services/portal.service';
import {UserService} from '../services/user.service';
import {ErrorItem} from '../models/error-item';
import {ErrorEvent} from '../models/error-event';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../models/portal-resources';

@Component({
    selector: 'error-list',
    templateUrl: 'templates/error-list.component.html',
    styleUrls: ['styles/error-list.style.css']
})
export class ErrorListComponent {
    public errorList: ErrorItem[];
    // TODO: _portalService is used in the view to get sessionId. Change this when sessionId is observable.
    constructor(private _broadcastService: BroadcastService, public _portalService: PortalService, private _translateService: TranslateService)
    {
        this.errorList = [];
        _broadcastService.subscribe<ErrorEvent>(BroadcastEvent.Error, (e) => {
            var errorItem: ErrorItem = e && e.message ? { message: e.message, dateTime: new Date().toISOString() } : this.getGenericError()
            if (!this.errorList.find(e => e.message === errorItem.message)) {
                this.errorList.push(errorItem);
            }
        });
    }

    private getGenericError(): ErrorItem {
        return {
            message: this._translateService.instant(PortalResources.errorList_youMay),
            href: 'http://go.microsoft.com/fwlink/?LinkId=780719',
            hrefText: this._translateService.instant(PortalResources.errorList_here),
            dateTime: new Date().toISOString()
        };
    }

    dismissError(index: number) {
        this.errorList.splice(index, 1);
    }
}