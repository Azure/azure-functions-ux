import {Http, Headers} from 'angular2/http';
import {Injectable} from 'angular2/core';
import {FunctionInfo, FunctionSecrets} from '../models/function-info';
import {VfsObject} from '../models/vfs-object';
import {ScmInfo} from '../models/scm-info';
import {PassthroughInfo} from '../models/passthrough-info';
import {IFunctionsService} from './ifunctions.service';
import {FunctionTemplate} from '../models/function-template';
import {RunResponse} from '../models/run-response';
import {Observable} from 'rxjs/Observable';
import {DesignerSchema} from '../models/designer-schema';

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
            url: `${this.scmInfo.scm_url}/api/functions`
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
        if (file.isNew) {
            file.href = `${file.href}${file.name}`;
        }
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
            .map<VfsObject>(r => file);
    }

    getTemplates() {
        var body: PassthroughInfo = {
            httpMethod: "GET",
            url: `${this.scmInfo.scm_url}/api/functions/templates`
        };
        return this._http.post('api/passthrough', JSON.stringify(body), { headers: this.getHeaders() })
            .map<FunctionTemplate[]>(r => r.json());
    }

    createFunction(functionName: string, templateId: string) {
        var body: PassthroughInfo = {
            httpMethod: 'PUT',
            url: `${this.scmInfo.scm_url}/api/functions/${functionName}`,
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
            isDeleted: false,
            secrets_file_href: null,
            secrets: null
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
            script_root_path_href: `${this.scmInfo.scm_url}/api/vfs/site/wwwroot/`,
            template_id: null,
            test_data_href: null,
            clientOnly: true,
            isDeleted: false,
            secrets_file_href: null,
            secrets: null
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
            url: `${this.scmInfo.scm_url.replace('.scm.', '.')}/api/${functionInfo.name.toLocaleLowerCase()}`,
            requestBody: content,
            mediaType: 'plain/text'
        };
        return this._http.post('api/passthrough', JSON.stringify(body), { headers: this.getHeaders() })
            .catch(e => Observable.of({
                text: () => JSON.stringify(e)
            }))
            .map<string>(r => r.text());
    }

    getRunStatus(functionInfo: FunctionInfo, runId: string) {
        var body: PassthroughInfo = {
            httpMethod: 'GET',
            url: `${functionInfo.href}/status/${runId}`
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

    getDesignerSchema() {
        return this._http.get('mocks/function-json-schema.json')
            .map<DesignerSchema>(r => r.json());
    }

    warmupMainSite() {
        var body: PassthroughInfo = {
            httpMethod: 'GET',
            url: this.scmInfo.scm_url.replace('.scm.', '.')
        };
        this._http.post('api/passthrough', JSON.stringify(body), { headers: this.getHeaders() })
            .subscribe(() => { }, e => { if (e.status === 503) { this.warmupMainSite(); } else { this.warmupMainSiteApi(); } });
    }

    warmupMainSiteApi() {
        var body: PassthroughInfo = {
            httpMethod: 'GET',
            url: `${this.scmInfo.scm_url.replace('.scm.', '.')}/api/`
        };
        this._http.post('api/passthrough', JSON.stringify(body), { headers: this.getHeaders() })
            .subscribe(() => { }, e => { if (e.status === 503) { this.warmupMainSiteApi(); } });
    }

    getSecrets(fi: FunctionInfo) {
        var body: PassthroughInfo = {
            httpMethod: 'GET',
            url: fi.secrets_file_href
        };
        return this._http.post('api/passthrough', JSON.stringify(body), { headers: this.getHeaders() })
            .catch(_ => Observable.of({
                json: () => { return {}; }
            }))
            .map<FunctionSecrets>(r => r.json());
    }

    setSecrets(fi: FunctionInfo, secrets: FunctionSecrets) {
        var file: VfsObject = {
            href: fi.secrets_file_href,
            content: '',
            isDirty: false,
            isNew: false,
            name: ''
        };
        return this.saveFile(file, JSON.stringify(secrets)).map<FunctionSecrets>(e => secrets);
    }

    getFunctionInvokeUrl(fi: FunctionInfo) {
        return `${this.scmInfo.scm_url.replace('.scm.', '.')}/api/${fi.name}`;
    }

    private getHeaders(contentType?: string): Headers {
        contentType = contentType || 'application/json';
        var headers = new Headers();
        headers.append('Content-Type', contentType);
        return headers;
    }
}