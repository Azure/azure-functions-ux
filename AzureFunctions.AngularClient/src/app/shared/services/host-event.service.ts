import {Injectable} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import {HostEvent} from '../models/host-event'
import { FunctionApp } from './../../shared/function-app';
import { ConfigService } from '../services/config.service';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import {ArmObj} from '../models/arm/arm-obj';
import {Site} from '../models/arm/site';
import {UserService} from '../services/user.service';

declare var monaco;

@Injectable()
export class HostEventService {

    private eventStream: ReplaySubject<HostEvent>;
    private tokenSubscription : Subscription;
    private token: string;
    private req : XMLHttpRequest;
    private timeouts: number[] = [];

    private currentPosition : number = 0;
    private currentStream : string;

    constructor(
      private _http: Http,
      private _userService: UserService,
      private _configService : ConfigService) {
        this.eventStream = new ReplaySubject<HostEvent>();
        this.tokenSubscription = this._userService.getStartupInfo().subscribe(s => this.token = s.token);

        this.readHostEvents();
    }

    get Events() {
        return this.eventStream;
    }

     private readHostEvents(createEmpty: boolean = true, log?: string) {
        const maxCharactersInLog = 500000;
        const intervalIncreaseThreshold = 1000;
        const defaultInterval = 500;
        const maxInterval = 10000;
        let currentLength = '';
        let oldLength : number;

        var promise = new Promise<string>((resolve, reject) => {

            if (this.req) {
                this.timeouts.forEach(window.clearTimeout);
                this.timeouts = [];
                this.req.abort();
                this.currentPosition = 0;
            }

            let scmUrl = FunctionApp.getScmUrl(this._configService, FunctionApp.site );
            let url = `${scmUrl}/api/logstream/application/functions/structured`;
            
            // TODO: Spend more time investigating a cleaner way to do this...
            // TODO: Need to periodically refresh this connection and handle errors
           this.req = new XMLHttpRequest();
            this.req.open('GET', url, true);
            this.req.setRequestHeader('Authorization', `Bearer ${this.token}`);
            this.req.setRequestHeader('FunctionsPortal', '1');
            this.req.send(null);

            var callBack = () => {
                var diff = this.req.responseText.length - this.currentPosition;
                if (diff > 0) {
                    resolve(null);
                    if (this.req.responseText.length) {
                        let newText : string = this.req.responseText.substring(this.currentPosition);
                        let lines = newText.split('\n');
                        
                        lines.filter(l => l.startsWith('{'))
                            .map(l => JSON.parse(l))
                            .forEach(e => this.eventStream.next(e));

                        this.currentPosition += newText.lastIndexOf('\n');
                    } 
                } 
                if (this.req.readyState === XMLHttpRequest.DONE) {
                    this.readHostEvents();
                } else {
                    this.timeouts.push(window.setTimeout(callBack, defaultInterval));
                }
            };
            callBack();

        });

        return promise;
    }
}
