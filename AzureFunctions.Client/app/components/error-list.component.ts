import {Component} from 'angular2/core';
import {IBroadcastService, BroadcastEvent} from '../services/ibroadcast.service';
import {ErrorItem} from '../models/error-item';

@Component({
    selector: 'error-list',
    template: `
    <div class="error-list">
        <div class="error-box" *ngFor="#error of errorList; #i = index">
            <div class="clickable close-button" (click)="dismissError(i)">x</div>
            <div class="error-message">
                <p><strong>Error:</strong></p>
                <p>{{error.message}}</p>
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
    constructor(private _broadcastService: IBroadcastService) {
        this.errorList = [];
        _broadcastService.subscribe(BroadcastEvent.Error, (e: string) => {
            this.errorList.push({
                message: e,
            });
        });
    }

    dismissError(index: number) {
        this.errorList.splice(index, 1);
    }
}