"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var portal_resources_1 = require("./../models/portal-resources");
var RequiredValidator = (function () {
    function RequiredValidator(_translateService) {
        this._translateService = _translateService;
    }
    RequiredValidator.prototype.validate = function (control) {
        return (control.dirty || control._msRunValidation) && !control.value
            ? { "required": this._translateService.instant(portal_resources_1.PortalResources.validation_requiredError) }
            : null;
    };
    return RequiredValidator;
}());
exports.RequiredValidator = RequiredValidator;
//# sourceMappingURL=requiredValidator.js.map