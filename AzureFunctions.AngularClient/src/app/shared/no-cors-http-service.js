"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("@angular/http");
require("rxjs/add/operator/catch");
require("rxjs/add/operator/mergeMap");
var error_event_1 = require("./models/error-event");
var error_ids_1 = require("./models/error-ids");
var portal_resources_1 = require("./models/portal-resources");
var broadcast_event_1 = require("./models/broadcast-event");
var NoCorsHttpService = (function () {
    function NoCorsHttpService(_http, _broadcastService, _aiService, _translateService, portalHeadersCallback) {
        this._http = _http;
        this._broadcastService = _broadcastService;
        this._aiService = _aiService;
        this._translateService = _translateService;
        this.portalHeadersCallback = portalHeadersCallback;
    }
    NoCorsHttpService.prototype.request = function (url, options) {
        var _this = this;
        return this._http.request(url, options)
            .catch(function (e) { return _this.tryPassThroughController(e, options.method.toString(), url, options.body, options); });
    };
    /**
     * Performs a request with `get` http method.
     */
    NoCorsHttpService.prototype.get = function (url, options) {
        var _this = this;
        return this._http.get(url, options)
            .catch(function (e) { return _this.tryPassThroughController(e, 'GET', url, null, options); });
    };
    /**
     * Performs a request with `post` http method.
     */
    NoCorsHttpService.prototype.post = function (url, body, options) {
        var _this = this;
        return this._http.post(url, body, options)
            .catch(function (e) { return _this.tryPassThroughController(e, 'POST', url, body, options); });
    };
    /**
     * Performs a request with `put` http method.
     */
    NoCorsHttpService.prototype.put = function (url, body, options) {
        var _this = this;
        return this._http.put(url, body, options)
            .catch(function (e) { return _this.tryPassThroughController(e, 'PUT', url, body, options); });
    };
    /**
     * Performs a request with `delete` http method.
     */
    NoCorsHttpService.prototype.delete = function (url, options) {
        var _this = this;
        return this._http.delete(url, options)
            .catch(function (e) { return _this.tryPassThroughController(e, 'DELETE', url, null, options); });
    };
    /**
     * Performs a request with `patch` http method.
     */
    NoCorsHttpService.prototype.patch = function (url, body, options) {
        var _this = this;
        return this._http.patch(url, body, options)
            .catch(function (e) { return _this.tryPassThroughController(e, 'PATCH', url, null, options); });
    };
    /**
     * Performs a request with `head` http method.
     */
    NoCorsHttpService.prototype.head = function (url, options) {
        var _this = this;
        return this._http.head(url, options)
            .catch(function (e) { return _this.tryPassThroughController(e, 'HEAD', url, null, options); });
    };
    /**
     * Performs a request with `options` http method.
     */
    NoCorsHttpService.prototype.options = function (url, options) {
        var _this = this;
        return this._http.options(url, options)
            .catch(function (e) { return _this.tryPassThroughController(e, 'OPTIONS', url, null, options); });
    };
    NoCorsHttpService.prototype.tryPassThroughController = function (error, method, url, body, options) {
        var _this = this;
        if (error.status === 0 && error.type === http_1.ResponseType.Error) {
            return this._http.get('/api/ping')
                .catch(function (_) {
                if (!error.isHandled) {
                    _this._broadcastService.broadcast(broadcast_event_1.BroadcastEvent.Error, {
                        message: _this._translateService.instant(portal_resources_1.PortalResources.error_appOffline),
                        errorId: error_ids_1.ErrorIds.applicationOffline,
                        errorType: error_event_1.ErrorType.Fatal,
                        resourceId: url
                    });
                    error.isHandled = true;
                }
                throw error;
            })
                .mergeMap(function (_) {
                var headers = {};
                if (options && options.headers) {
                    options.headers.forEach(function (v, n) {
                        headers[n] = v.join(',');
                    });
                }
                var passThroughBody = {
                    method: method,
                    url: url,
                    body: body,
                    headers: headers
                };
                return _this._http.post('/api/passthrough', passThroughBody, { headers: _this.portalHeadersCallback() })
                    .catch(function (e) {
                    if (e.status === 400) {
                        var content = null;
                        try {
                            content = e.json();
                        }
                        catch (e) {
                            content = null;
                        }
                        if (content && content.reason && content.reason === 'PassThrough') {
                            // this means there was a /passthrough specific error, so log it and throw the original error.
                            _this._aiService.trackEvent(error_ids_1.ErrorIds.passThroughApiError, content);
                            throw error;
                        }
                    }
                    throw e;
                });
            });
        }
        else {
            throw error;
        }
    };
    return NoCorsHttpService;
}());
exports.NoCorsHttpService = NoCorsHttpService;
//# sourceMappingURL=no-cors-http-service.js.map