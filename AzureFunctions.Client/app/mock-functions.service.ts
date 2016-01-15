import {Http} from 'angular2/http';
import {Injectable} from 'angular2/core';
import {FunctionInfo} from './function-info';
import {VfsObject} from './vfs-object';
import {ScmInfo} from './scm-info';
import {IFunctionsService} from './ifunctions.service';
import {Observable} from 'rxjs/Observable';
import {FunctionTemplate} from './function-template';

@Injectable()
export class MockFunctionsService implements IFunctionsService {
    private scmInfo: ScmInfo;

    constructor(private _http: Http) { }

    initializeUser() {
        return this._http.get('mocks/scmInfo.json')
            .map<ScmInfo>(r => {
                this.scmInfo = r.json();
                return this.scmInfo;
            });
    }

    getFunctions() {
        return this._http.get('mocks/functions.json')
            .map<FunctionInfo[]>(r => r.json());
    }

    getFunctionContent(functionInfo: FunctionInfo) {
        return this._http.get('mocks/' + functionInfo.name + '.vfs.json')
            .map<any>(r => {
                return {
                    files: r.json(),
                    functionInfo: functionInfo
                };
            });
    }

    getFileContent(file: VfsObject) {
        return this._http.get(file.href)
            .map<string>(r => r.text());
    }

    saveFile(file: VfsObject, updatedContent: string) {
        console.log(file);
        console.log(updatedContent);
        file.isDirty = false;
        return Observable.of("Ok");
    }

    createFunction(functionName: string, templateId: string) {
        console.log(functionName);
        console.log(templateId);
        return Observable.of("Ok");
    }

    getTemplates() {
        return this._http.get('mocks/functionTemplates.json')
            .map<FunctionTemplate[]>(r => r.json());
    }

    getNewFunctionNode(): FunctionInfo {
        return {
            name: 'New Function',
            href: null,
            config: null,
            config_href: null,
            expanded: false,
            files: null,
            script_href: null,
            script_root_path_href: null,
            template_id: null,
            test_data_href: null,
            clientOnly: true
        };
    }

    getSettingsNode(): FunctionInfo {
        return {
            name: "Settings",
            href: null,
            config: null,
            config_href: null,
            expanded: false,
            files: null,
            script_href: null,
            script_root_path_href: 'mocks/host.vfs.json',
            template_id: null,
            test_data_href: null,
            clientOnly: true
        };
    }

    getNewFileObject(): VfsObject {
        return {
            name: '',
            href: 'mocks/',
            isNew: true,
            isDirty: true,
            content: ''
        };
    }
}