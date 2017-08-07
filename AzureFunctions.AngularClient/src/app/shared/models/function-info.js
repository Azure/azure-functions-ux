"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FunctionInfoHelper = (function () {
    function FunctionInfoHelper() {
    }
    FunctionInfoHelper.getLanguage = function (fi) {
        var fileName = fi.script_href.substring(fi.script_href.lastIndexOf('/') + 1);
        var fileExt = fileName.split(".")[1].toLowerCase();
        var lang = "";
        switch (fileExt) {
            case "sh":
                lang = "Bash";
                break;
            case "bat":
                lang = "Batch";
                //bat
                break;
            case "csx":
                lang = "CSharp";
                //csharp
                break;
            case "fsx":
                lang = "FSharp";
                //fsharp
                break;
            case "js":
                lang = "JavaScript";
                //javascript
                break;
            case "php":
                lang = "Php";
                break;
            case "ps1":
                lang = "Powershell";
                //powershell
                break;
            case "py":
                lang = "Python";
                //python
                break;
            case "ts":
                lang = "TypeScript";
                //typescript
                break;
        }
        return lang;
    };
    return FunctionInfoHelper;
}());
exports.FunctionInfoHelper = FunctionInfoHelper;
//# sourceMappingURL=function-info.js.map