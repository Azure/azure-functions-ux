import { Headers, Response } from '@angular/http';
import { Constants } from './../models/constants';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { CacheService } from './cache.service';
import { Subject, Observable } from 'rxjs/Rx';
import { StartupInfo } from './../models/portal';
import { UserService } from './user.service';
import { Injectable } from '@angular/core';

@Injectable()
export class LanguageService {

  private _extensionVersionStream = new Subject<string>();

  constructor(
    private _userService : UserService,
    private _cacheService : CacheService,
    private _translateService : TranslateService) {

    this._userService.getStartupInfo()
    .flatMap(info =>{
      return this._extensionVersionStream.map(v => {
        return {startupInfo : info, extensionVersion : v}
      });
    })
    .flatMap(result =>{
        var runtime = result.extensionVersion ? result.extensionVersion : "default";
        if (this._userService.inIFrame) {

            // Effective language has language and formatting information eg: "en.en-us"
            let lang = result.startupInfo.effectiveLocale.split(".")[0];
            return this._getLocalizedResources(result.startupInfo, lang, runtime);
        }
        else{
            return this._getLocalizedResources(result.startupInfo, "en", runtime);
        }      
    })
    .subscribe(r =>{
    })
  }

  getResources(extensionVersion : string){
    this._extensionVersionStream.next(extensionVersion);
  }

  private _getLocalizedResources(startupInfo : StartupInfo, lang: string, runtime: string): Observable<any> {
      return this._cacheService.get(
          `${Constants.serviceHost}api/resources?name=${lang}&runtime=${runtime}`,
          false,
          this._getApiControllerHeaders(startupInfo.token))

          .retryWhen(this._retryAntares)
          .map<any>(r => {
              var resources = r.json();

              this._translateService.setDefaultLang("en");
              this._translateService.setTranslation("en", resources.en);
              if (resources.lang) {
                  this._translateService.setTranslation(lang, resources.lang);
              }
              this._translateService.use(lang);
          });
  }

  private _getApiControllerHeaders(token : string, contentType?: string): Headers {
      contentType = contentType || 'application/json';
      var headers = new Headers();
      headers.append('Content-Type', contentType);
      headers.append('Accept', 'application/json,*/*');

      if (token) {
          headers.append('client-token', token);
          headers.append('portal-token', token);
      }

      return headers;
  }

    private _retryAntares(error: Observable<any>): Observable<any> {
        return error.scan<number>((errorCount, err: Response) => {
                if (errorCount >= 10) {
                    throw err;
                } else {
                    return errorCount + 1;
                }
            }, 0).delay(1000);
    }

}
