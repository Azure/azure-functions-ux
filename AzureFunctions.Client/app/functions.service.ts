import {Http, Headers} from 'angular2/http';
import {Injectable} from 'angular2/core';
import {FunctionInfo} from './function-info';
import {VfsObject} from './vfs-object';
import {ScmInfo} from './scm-info';
import {PassthroughInfo} from './passthrough-info';
import {IFunctionsService} from './ifunctions.service';
import {FunctionTemplate} from './function-template';
import {RunResponse} from './run-response';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class FunctionsService implements IFunctionsService {
    private scmInfo: ScmInfo;
    constructor(private _http: Http) { }

    initializeUser() {
        return this._http.post('api/init', '', { headers: this.getHeaders() })
            .map<ScmInfo>(r => {
                this.scmInfo = r.json();
                return this.scmInfo;
            });
    }

    getFunctions() {
        var body: PassthroughInfo = {
            httpMethod: 'GET',
            url: this.scmInfo.scm_url + '/api/functions'
        };
        return this._http.post('api/passthrough', JSON.stringify(body), { headers: this.getHeaders() })
            .map<FunctionInfo[]>(r => r.json());
    }

    getFunctionContent(functionInfo: FunctionInfo) {
        var body: PassthroughInfo = {
            httpMethod: 'GET',
            url: functionInfo.script_root_path_href
        };
        return this._http.post('api/passthrough', JSON.stringify(body), { headers: this.getHeaders() })
            .map<any>(r => {
                return {
                    files: r.json().filter(e => e.mime !== 'inode/directory'),
                    functionInfo: functionInfo
                };
            });
    }

    getFileContent(file: VfsObject) {
        var body: PassthroughInfo = {
            httpMethod: 'GET',
            url: file.href
        };
        return this._http.post('api/passthrough', JSON.stringify(body), { headers: this.getHeaders() })
            .map<string>(r => r.text());
    }

    saveFile(file: VfsObject, updatedContent: string) {
        var body: PassthroughInfo = {
            httpMethod: "PUT",
            url: file.href,
            requestBody: updatedContent,
            headers: {
                'If-Match': '*'
            },
            mediaType: 'plain/text'
        };
        return this._http.post('api/passthrough', JSON.stringify(body), { headers: this.getHeaders() })
            .map<string>(r => r.statusText);
    }

    getTemplates() {
        var body: PassthroughInfo = {
            httpMethod: "GET",
            url: this.scmInfo.scm_url + '/api/functions/templates'
        };
        return this._http.post('api/passthrough', JSON.stringify(body), { headers: this.getHeaders() })
            .map<FunctionTemplate[]>(r => r.json());
    }

    createFunction(functionName: string, templateId: string) {
        var body: PassthroughInfo = {
            httpMethod: 'PUT',
            url: this.scmInfo.scm_url + '/api/functions/' + functionName,
            requestBody: (templateId && templateId !== 'Empty' ? { template_id: templateId } : null)
        };
        return this._http.post('api/passthrough', JSON.stringify(body), { headers: this.getHeaders() })
            .map<string>(r => r.statusText);
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
            clientOnly: true,
            isDeleted: false
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
            script_root_path_href: this.scmInfo.scm_url + '/api/vfs/site/wwwroot/app_data/jobs/functions/',
            template_id: null,
            test_data_href: null,
            clientOnly: true,
            isDeleted: false
        };
    }

    getNewFileObject(functionInfo: FunctionInfo): VfsObject {
        return {
            name: '',
            href: functionInfo.script_root_path_href,
            isNew: true,
            isDirty: true,
            content: ''
        };
    }

    getTestData(functionInfo: FunctionInfo) {
        var body: PassthroughInfo = {
            httpMethod: 'GET',
            url: functionInfo.test_data_href,
        };
        return this._http.post('api/passthrough', JSON.stringify(body), { headers: this.getHeaders() })
            .catch(e => Observable.of({
                text: () => ''
            }))
            .map<VfsObject>(r => {
                return {
                    name: 'sample.dat',
                    content: r.text(),
                    href: functionInfo.test_data_href,
                    isNew: false,
                    isDirty: false
                };
            });
    }

    runFunction(functionInfo: FunctionInfo, content: string) {
        var body: PassthroughInfo = {
            httpMethod: 'POST',
            url: functionInfo.href + '/run',
            requestBody: content,
            mediaType: 'plain/text'
        };
        return this._http.post('api/passthrough', JSON.stringify(body), { headers: this.getHeaders() })
            .map<RunResponse>(r => r.json());
    }

    getRunStatus(functionInfo: FunctionInfo, runId: string) {
        var body: PassthroughInfo = {
            httpMethod: 'GET',
            url: functionInfo.href + '/status/' + runId
        };
        return this._http.post('api/passthrough', JSON.stringify(body), { headers: this.getHeaders() })
            .catch(e => Observable.of({
                text: () => e.text()
            }))
            .map<string>(r => r.text());
    }

    deleteFunction(functionInfo: FunctionInfo) {
        var body: PassthroughInfo = {
            httpMethod: 'DELETE',
            url: functionInfo.href
        };
        return this._http.post('api/passthrough', JSON.stringify(body), { headers: this.getHeaders() })
            .map<string>(r => r.statusText);
    }

    private getHeaders(contentType?: string): Headers {
        contentType = contentType || 'application/json';
        var headers = new Headers();
        headers.append('Content-Type', contentType);
        return headers;
    }
}