import { Injectable } from '@angular/core';
import { Headers, Http, Request } from '@angular/http';
import { ArmObj } from '../../../../shared/models/arm/arm-obj';
import { Site } from '../../../../shared/models/arm/site';
import { PublishingCredentials } from '../../../../shared/models/publishing-credentials';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

export enum ConsoleTypes {
  CMD = 1,
  PS = 2,
  BASH = 3,
  SSH = 4,
}

@Injectable()
export class ConsoleService {
  private _resourceIdSubject = new BehaviorSubject<string>('');
  private _siteSubject = new BehaviorSubject<ArmObj<Site>>(undefined);
  private _publishingCredentialsSubject = new BehaviorSubject<ArmObj<PublishingCredentials>>(undefined);

  constructor(private _http: Http) {}

  /**
   *  Send the resource ID to child components
   */
  sendResourceId(resourceId: string) {
    this._resourceIdSubject.next(resourceId);
  }

  /**
   *  Send the site object to child components
   */
  sendSite(site: ArmObj<Site>) {
    this._siteSubject.next(site);
  }

  /**
   *  Send the publishing credentials' object to child components
   */
  sendPublishingCredentials(publishingCredentials: ArmObj<PublishingCredentials>) {
    this._publishingCredentialsSubject.next(publishingCredentials);
  }

  /**
   *  Get resourceID
   */
  getResourceId(): Observable<string> {
    return this._resourceIdSubject.asObservable();
  }

  /**
   *  Get Site object as Observable
   */
  getSite(): Observable<ArmObj<Site>> {
    return this._siteSubject.asObservable();
  }

  /**
   *  Get publishing credentials as Observable
   */
  getPublishingCredentials(): Observable<ArmObj<PublishingCredentials>> {
    return this._publishingCredentialsSubject.asObservable();
  }

  /**
   * Connect the given service(url) using the passed in method,
   * body and header elements.
   * @param method : String, one of {GET, POST, PUT, DELETE}
   * @param url : String
   * @param body: any?
   * @param headers: Headers?
   */
  send(method: string, url: string, body?: any, headers?: Headers) {
    const request = new Request({
      url: url,
      method: method,
      search: null,
      headers: headers,
      body: body ? body : null,
    });
    return this._http.request(request);
  }

  /**
   * Find all the strings which start with the given string, 'cmd' from the given string array
   * Incase the string is empty, the inital array of strings is returned.
   */
  findMatchingStrings(allFiles: string[], cmd: string): string[] {
    if (!cmd || cmd === '') {
      return allFiles;
    }
    const ltOfDir: string[] = [];
    cmd = cmd.toLowerCase();
    allFiles.forEach(element => {
      if (element.toLowerCase().startsWith(cmd)) {
        ltOfDir.push(element);
      }
    });
    return ltOfDir;
  }
}
