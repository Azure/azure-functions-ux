import { PortalService } from './portal.service';
import { StartupInfo } from './../models/portal';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { Headers, Response } from '@angular/http';

// Used so that the UserService can do initialization work without having to depend
// on the LanguageService, which would create a circular dependency
export class LanguageServiceHelper {
    public static getLanguageAndRuntime(startupInfo: StartupInfo, runtime: String) {
        let lang = 'en';
        runtime = runtime ? runtime : 'default';

        if (PortalService.inIFrame()) {

            // Effective language has language and formatting information eg: "en.en-us"
            lang = startupInfo.effectiveLocale.split('.')[0];
        }

        return {
            lang: lang,
            runtime: runtime
        };
    }

    public static setTranslation(stringResources: any, lang: string, ts: TranslateService) {
        ts.setDefaultLang('en');
        ts.setTranslation('en', stringResources.en);
        if (stringResources.lang) {
            ts.setTranslation(lang, stringResources.lang);
        }

        ts.use(lang);
    }

    public static getApiControllerHeaders(): Headers {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'application/json,*/*');

        return headers;
    }

    public static retry(error: Observable<any>): Observable<any> {
        return error.scan((errorCount: number, err: Response) => {
            if (errorCount >= 10) {
                throw err;
            } else {
                return errorCount + 1;
            }
        }, 0).delay(1000);
    }
}