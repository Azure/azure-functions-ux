"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var FeatureItem = (function () {
    function FeatureItem(title, keywords, info, imageUrl) {
        this.enabled = true;
        this.imageUrl = "images/activity-log.svg";
        this.title = title;
        this.keywords = keywords;
        this.info = info;
        this.imageUrl = imageUrl ? imageUrl : this.imageUrl;
    }
    FeatureItem.prototype.click = function () {
    };
    FeatureItem.prototype.dispose = function () {
    };
    return FeatureItem;
}());
exports.FeatureItem = FeatureItem;
var DisableableFeature = (function (_super) {
    __extends(DisableableFeature, _super);
    function DisableableFeature(title, keywords, info, imageUrl, _disableInfoStream, overrideDisableInfo // If the feature is known to be disabled before any async logic, then use this disable immediately
    ) {
        var _this = _super.call(this, title, keywords, info, imageUrl) || this;
        _this._disableInfoStream = _disableInfoStream;
        _this.enabled = false;
        if (overrideDisableInfo) {
            if (!overrideDisableInfo.enabled) {
                _this.warning = overrideDisableInfo.disableMessage;
            }
            _this.enabled = overrideDisableInfo.enabled;
        }
        else if (_disableInfoStream) {
            _this._enabledRxSub = _disableInfoStream.subscribe(function (info) {
                _this.enabled = info.enabled;
                if (!_this.enabled) {
                    _this.warning = info.disableMessage;
                }
            });
        }
        return _this;
    }
    DisableableFeature.prototype.dispose = function () {
        if (this._enabledRxSub) {
            this._enabledRxSub.unsubscribe();
            this._enabledRxSub = null;
        }
    };
    return DisableableFeature;
}(FeatureItem));
exports.DisableableFeature = DisableableFeature;
var DisableableBladeFeature = (function (_super) {
    __extends(DisableableBladeFeature, _super);
    function DisableableBladeFeature(title, keywords, info, imageUrl, _bladeInfo, _portalService, disableInfoStream, overrideDisableInfo) {
        var _this = _super.call(this, title, keywords, info, imageUrl, disableInfoStream, overrideDisableInfo) || this;
        _this._bladeInfo = _bladeInfo;
        _this._portalService = _portalService;
        return _this;
    }
    DisableableBladeFeature.prototype.click = function () {
        this._portalService.openBlade(this._bladeInfo, 'site-manage');
    };
    return DisableableBladeFeature;
}(DisableableFeature));
exports.DisableableBladeFeature = DisableableBladeFeature;
var DisableableDyanmicBladeFeature = (function (_super) {
    __extends(DisableableDyanmicBladeFeature, _super);
    function DisableableDyanmicBladeFeature(title, keywords, info, imageUrl, bladeInfo, portalService, disableInfoStream, overrideDisableInfoStream) {
        return _super.call(this, title, keywords, info, imageUrl, bladeInfo, portalService, disableInfoStream, overrideDisableInfoStream) || this;
    }
    DisableableDyanmicBladeFeature.prototype.click = function () {
        this._portalService.openBlade(this._bladeInfo, 'site-manage');
    };
    return DisableableDyanmicBladeFeature;
}(DisableableBladeFeature));
exports.DisableableDyanmicBladeFeature = DisableableDyanmicBladeFeature;
var BladeFeature = (function (_super) {
    __extends(BladeFeature, _super);
    function BladeFeature(title, keywords, info, imageUrl, bladeInfo, _portalService) {
        var _this = _super.call(this, title, keywords, info, imageUrl) || this;
        _this.bladeInfo = bladeInfo;
        _this._portalService = _portalService;
        return _this;
    }
    BladeFeature.prototype.click = function () {
        this._portalService.openBlade(this.bladeInfo, 'site-manage');
    };
    return BladeFeature;
}(FeatureItem));
exports.BladeFeature = BladeFeature;
var OpenBrowserWindowFeature = (function (_super) {
    __extends(OpenBrowserWindowFeature, _super);
    function OpenBrowserWindowFeature(title, keywords, info, _url) {
        var _this = _super.call(this, title, keywords, info) || this;
        _this._url = _url;
        return _this;
    }
    OpenBrowserWindowFeature.prototype.click = function () {
        window.open(this._url);
    };
    return OpenBrowserWindowFeature;
}(FeatureItem));
exports.OpenBrowserWindowFeature = OpenBrowserWindowFeature;
var TabFeature = (function (_super) {
    __extends(TabFeature, _super);
    function TabFeature(title, keywords, info, componentName, tabSub) {
        var _this = _super.call(this, title, keywords, info) || this;
        _this.componentName = componentName;
        _this.tabSub = tabSub;
        return _this;
    }
    TabFeature.prototype.click = function () {
        this.tabSub.next(this.componentName.toLowerCase());
    };
    return TabFeature;
}(FeatureItem));
exports.TabFeature = TabFeature;
//# sourceMappingURL=feature-item.js.map