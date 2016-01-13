import {Http} from 'angular2/http';
import {Injectable} from 'angular2/core';
import {FunctionInfo} from './function-info';
import {VfsObject} from './vfs-object';
import {ScmInfo} from './scm-info';
import {IFunctionsService} from './ifunctions.service';

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
}