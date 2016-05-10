import {Injectable} from 'angular2/core';
import {Http, Headers} from 'angular2/http';
import {UserService} from './user.service';

@Injectable()
export class BackgroundTasksService {

// Ping host
// Check readonly status
// update token
// Check host version
    //
    constructor(private _http: Http, private _userService: UserService) {
        this.runTasks();
        window.setInterval(() => this.runTasks(), 60000);
    }

    runTasks() {
        if (!this._userService.inIFrame) {
            this._http.get('api/token?plaintext=true')
                .retry(5)
                .map<string>(r => r.text())
                .subscribe(t => this._userService.setToken(t));
        }
    }
}