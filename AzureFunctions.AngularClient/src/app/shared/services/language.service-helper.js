"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var portal_service_1 = require("./portal.service");
var http_1 = require("@angular/http");
// Used so that the UserService can do initialization work without having to depend
// on the LanguageService, which would create a circular dependency
var LanguageServiceHelper = (function () {
    function LanguageServiceHelper() {
    }
    LanguageServiceHelper.getLanguageAndRuntime = function (startupInfo, runtime) {
        var lang = 'en';
        runtime = runtime ? runtime : 'default';
        if (portal_service_1.PortalService.inIFrame()) {
            // Effective language has language and formatting information eg: "en.en-us"
            lang = startupInfo.effectiveLocale.split('.')[0];
        }
        return {
            lang: lang,
            runtime: runtime
        };
    };
    LanguageServiceHelper.setTranslation = function (stringResources, lang, ts) {
        ts.setDefaultLang('en');
        ts.setTranslation('en', stringResources.en);
        if (stringResources.lang) {
            ts.setTranslation(lang, stringResources.lang);
        }
        ts.use(lang);
    };
    LanguageServiceHelper.getApiControllerHeaders = function () {
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'application/json,*/*');
        return headers;
    };
    LanguageServiceHelper.retry = function (error) {
        return error.scan(function (errorCount, err) {
            if (errorCount >= 10) {
                throw err;
            }
            else {
                return errorCount + 1;
            }
        }, 0).delay(1000);
    };
    return LanguageServiceHelper;
}());
exports.LanguageServiceHelper = LanguageServiceHelper;
//# sourceMappingURL=language.service-helper.js.map