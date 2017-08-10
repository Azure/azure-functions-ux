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
var binding_1 = require("./binding");
var BindingInputBase = (function () {
    function BindingInputBase() {
        this.isValid = true;
        this.isHidden = false;
        this.validators = [];
    }
    return BindingInputBase;
}());
exports.BindingInputBase = BindingInputBase;
var CheckboxInput = (function (_super) {
    __extends(CheckboxInput, _super);
    function CheckboxInput() {
        var _this = _super.call(this) || this;
        _this.type = binding_1.SettingType.boolean;
        return _this;
    }
    return CheckboxInput;
}(BindingInputBase));
exports.CheckboxInput = CheckboxInput;
var TextboxInput = (function (_super) {
    __extends(TextboxInput, _super);
    function TextboxInput() {
        var _this = _super.call(this) || this;
        _this.type = binding_1.SettingType.string;
        _this.noErrorClass = '';
        _this.errorClass = 'has-error';
        return _this;
    }
    return TextboxInput;
}(BindingInputBase));
exports.TextboxInput = TextboxInput;
var TextboxIntInput = (function (_super) {
    __extends(TextboxIntInput, _super);
    function TextboxIntInput() {
        var _this = _super.call(this) || this;
        _this.type = binding_1.SettingType.int;
        _this.noErrorClass = '';
        _this.errorClass = 'has-error';
        return _this;
    }
    return TextboxIntInput;
}(BindingInputBase));
exports.TextboxIntInput = TextboxIntInput;
var LabelInput = (function (_super) {
    __extends(LabelInput, _super);
    function LabelInput() {
        var _this = _super.call(this) || this;
        _this.type = binding_1.SettingType.label;
        return _this;
    }
    return LabelInput;
}(BindingInputBase));
exports.LabelInput = LabelInput;
var SelectInput = (function (_super) {
    __extends(SelectInput, _super);
    function SelectInput() {
        var _this = _super.call(this) || this;
        _this.type = binding_1.SettingType.enum;
        return _this;
    }
    return SelectInput;
}(BindingInputBase));
exports.SelectInput = SelectInput;
var PickerInput = (function (_super) {
    __extends(PickerInput, _super);
    function PickerInput() {
        var _this = _super.call(this) || this;
        _this.inProcess = false;
        _this.type = binding_1.SettingType.picker;
        _this.noErrorClass = '';
        _this.errorClass = 'has-error';
        return _this;
    }
    return PickerInput;
}(BindingInputBase));
exports.PickerInput = PickerInput;
var CheckBoxListInput = (function (_super) {
    __extends(CheckBoxListInput, _super);
    function CheckBoxListInput() {
        var _this = _super.call(this) || this;
        _this.type = binding_1.SettingType.checkBoxList;
        return _this;
    }
    CheckBoxListInput.prototype.toInternalValue = function () {
        var _this = this;
        if (!this.value) {
            this.value = [];
        }
        var valueDup = this.value.slice();
        this.value = {};
        valueDup.forEach(function (v) {
            _this.value[v] = true;
        });
        this.enum.forEach(function (v) {
            if (!_this.value[v.value]) {
                _this.value[v.value] = false;
            }
        });
    };
    CheckBoxListInput.prototype.getArrayValue = function () {
        var result = [];
        for (var property in this.value) {
            if (this.value.hasOwnProperty(property)) {
                if (this.value[property]) {
                    result.push(property);
                }
            }
        }
        return result;
    };
    CheckBoxListInput.prototype.isEqual = function (value) {
        for (var property in this.value) {
            if (this.value.hasOwnProperty(property)) {
                if (this.value[property] !== value.value[property]) {
                    return false;
                }
            }
        }
        return true;
    };
    return CheckBoxListInput;
}(BindingInputBase));
exports.CheckBoxListInput = CheckBoxListInput;
//# sourceMappingURL=binding-input.js.map