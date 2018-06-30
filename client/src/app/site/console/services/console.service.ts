import { Injectable } from '@angular/core';
import { Headers, Http, Request } from '@angular/http';
// import { UserService } from '../../../shared/services/user.service';

@Injectable()
export class ConsoleService {

    // private _token: string;
    // private _sessionId: string;

    constructor(
        private _http: Http) {
            // _userService.getStartupInfo()
            // .subscribe(info => {
            //     this._token = info.token;
            //     this._sessionId = info.sessionId;
            // });
    }

  /**
   * Connect the given service(url) using the passed in method,
   * body and header elements.
   * @param method : String, one of {GET, POST, PUT, DELETE}
   * @param url : String
   * @param body: any?
   * @param headers: Headers?
   */
  send(method: string, url: string, body?: any, headers?: Headers){
    const request = new Request({
      url: url,
      method: method,
      search: null,
      headers: headers,
      body: body ? body : null
    });
    return this._http.request(request);
  }

  /**
   * Find all the strings which start with the given string, 'cmd' from the given string array
   * Incase the string is empty, the inital array of strings is returned.
   */
  findMatchingStrings(allFiles: string[], cmd: string): string[]{
    if(!cmd || cmd === ''){
      return allFiles;
    }
    const ltOfDir: string[] = [];
    cmd = cmd.toLowerCase();
    allFiles.forEach(element => {
      if(element.toLowerCase().startsWith(cmd)) {
        ltOfDir.push(element);
      }
    });
    return ltOfDir;
  }
}