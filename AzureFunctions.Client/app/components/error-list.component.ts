import {Component} from 'angular2/core';
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'
import {PortalService} from '../services/portal.service';
import {UserService} from '../services/user.service';
import {ErrorItem} from '../models/error-item';
import {ErrorEvent} from '../models/error-event';

@Component({
    selector: 'error-list',
    template: `
    <div class="error-list">
        <div class="error-box" *ngFor="#error of errorList; #i = index">
            <div class="clickable close-button" (click)="dismissError(i)">x</div>
            <div class="error-message">
                <p><strong>Error:</strong></p>
                <p>{{error.message}} <a *ngIf="error.href && error.hrefText" [attr.href]="error.href" target="_blank">{{error.hrefText}}</a></p>
                <p *ngIf="_portalService?.sessionId" style="font-size: smaller">Session Id: {{_portalService.sessionId}}</p>
                <p style="font-size: smaller">Timestamp: {{error.dateTime}}</p>
            </div>
        </div>
    </div>`,
    styles: [`
    div {
        color: #B94A48;
    }

    .error-list {
        top: 50px;
        right: 20px;
        position: fixed;
        width: 350px;
        z-index: 1000;
    }

    .error-box {
        padding: 20px;
        box-shadow: 0 2px 2px 0px rgba(0,0,0,0.3);
        background-color: #ECD0D0;
        border: 1px solid #e6c2c2;
        margin-bottom: 10px;
    }

    .close-button {
        position: relative;
        float: right;
        display: inline;
        height: 20px;
        right: -10px;
        top: -15px;
    }
    `]
})
export class ErrorListComponent {
    public errorList: ErrorItem[];
    // TODO: _portalService is used in the view to get sessionId. Change this when sessionId is observable.
    constructor(private _broadcastService: BroadcastService, public _portalService: PortalService)
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
            message: `You may be experiencing an error. If you're having issues, please post them`,
            href: 'http://go.microsoft.com/fwlink/?LinkId=780719',
            hrefText: 'here',
            dateTime: new Date().toISOString()
        };
    }

    dismissError(index: number) {
        this.errorList.splice(index, 1);
    }
}