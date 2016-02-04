import {Http, Headers} from 'angular2/http';
import {Injectable} from 'angular2/core';
import {FunctionInfo} from '../models/function-info';
import {VfsObject} from '../models/vfs-object';
import {ScmInfo} from '../models/scm-info';
import {PassthroughInfo} from '../models/passthrough-info';
import {IFunctionsService} from './ifunctions.service';
import {FunctionTemplate} from '../models/function-template';
import {RunResponse} from '../models/run-response';
import {Observable} from 'rxjs/Rx';
import {DesignerSchema} from '../models/designer-schema';
import {FunctionSecrets} from '../models/function-secrets';
import {Subscription} from '../models/subscription';
import {ServerFarm} from '../models/server-farm';

@Injectable()
export class FunctionsService implements IFunctionsService {
    private scmInfo: ScmInfo;
    constructor(private _http: Http) { }

    initializeUser() {
        return this._http.get('api/get', { headers: this.getHeaders() })
            .catch(e => {
                if (e.status === 500) {
                    return this.initializeUser().map(r => ({ json: () => r }));
                } else if (e.status === 404) {
                    return Observable.of({ json: () => undefined });
                } else {
                    return Observable.of(e);
                }
            })
            .map<ScmInfo>(r => {
                this.scmInfo = r.json();
                return this.scmInfo;
            });
    }

    createFunctionsContainer(subscriptionId: string) {
        return this._http.post(`api/create?subscriptionId=${subscriptionId}&location=West US`, '', { headers: this.getHeaders() })
            .catch(e => {
                if (e.status === 500) {
                    return this.createFunctionsContainer(subscriptionId).map(r => ({ json: () => r }));
                } else {
                    return Observable.of(e);
                }
            })
            .map<ScmInfo>(r => {
                this.scmInfo = r.json();
                return this.scmInfo;
            })
    }

    getFunctions() {
        var body: PassthroughInfo = {
            httpMethod: 'GET',
            url: `${this.scmInfo.scm_url}/api/functions`
        };
        return this._http.post('api/passthrough', JSON.stringify(body), { headers: this.getHeaders() })
            .catch(e => (e.status === 503 || e.status === 404 ? this.getFunctions().map(r => ({json: () => r})) : e))
            .map<FunctionInfo[]>(r => r.json());
    }

    getFileContent(file: VfsObject | string) {
        var body: PassthroughInfo = {
            httpMethod: 'GET',
            url: typeof file === 'string' ? file : file.href
        };
        return this._http.post('api/passthrough', JSON.stringify(body), { headers: this.getHeaders() })
            .catch(e => Observable.of({
                text: () => ''
            }))
            .map<string>(r => r.text());
    }

    saveFile(file: VfsObject | string, updatedContent: string) {
        var body: PassthroughInfo = {
            httpMethod: "PUT",
            url: typeof file === 'string' ? file : file.href,
            requestBody: updatedContent,
            headers: {
                'If-Match': '*'
            },
            mediaType: 'plain/text'
        };
        return this._http.post('api/passthrough', JSON.stringify(body), { headers: this.getHeaders() })
            .map<VfsObject|string>(r => file);
    }

    getTemplates() {
        var body: PassthroughInfo = {
            httpMethod: "GET",
            url: `${this.scmInfo.scm_url}/api/functions/templates`
        };
        return this._http.post('api/passthrough', JSON.stringify(body), { headers: this.getHeaders() })
            .catch(e => (e.status === 503 || e.status === 404 ? this.getTemplates().map(r => ({json: () => r})) : e))
            .map<FunctionTemplate[]>(r => r.json());
    }

    createFunction(functionName: string, templateId: string) {
        var body: PassthroughInfo = {
            httpMethod: 'PUT',
            url: `${this.scmInfo.scm_url}/api/functions/${functionName}`,
            requestBody: (templateId && templateId !== 'Empty' ? { template_id: templateId } : null)
        };
        return this._http.post('api/passthrough', JSON.stringify(body), { headers: this.getHeaders() })
            .map<FunctionInfo>(r => r.json());
    }

    getNewFunctionNode(): FunctionInfo {
        return {
            name: 'New Function',
            href: null,
            config: null,
            script_href: null,
            template_id: null,
            test_data_href: null,
            clientOnly: true,
            isDeleted: false,
            secrets_file_href: null
        };
    }

    getSettingsNode(): FunctionInfo {
        return {
            name: "Settings",
            href: null,
            config: null,
            script_href: `${this.scmInfo.scm_url}/api/vfs/site/wwwroot/host.json`,
            template_id: null,
            test_data_href: null,
            clientOnly: true,
            isDeleted: false,
            secrets_file_href: null
        };
    }

    getLogStreamingNode() {
        return {
            name: 'Log Streaming',
            href: null,
            config: null,
            script_href: null,
            template_id: null,
            test_data_href: null,
            clientOnly: true,
            isDeleted: false,
            secrets_file_href: null
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
            .map<string>(r => r.text());
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
        return this.saveFile(fi.secrets_file_href, JSON.stringify(secrets))
            .map<FunctionSecrets>(e => secrets);
    }

    getFunctionInvokeUrl(fi: FunctionInfo) {
        return `${this.scmInfo.scm_url.replace('.scm.', '.')}/api/${fi.name}`;
    }

    saveFunction(fi: FunctionInfo, config: any) {
        var body: PassthroughInfo = {
            httpMethod: 'PUT',
            url: fi.href,
            requestBody: { config: config }
        };
        return this._http.post('api/passthrough', JSON.stringify(body), { headers: this.getHeaders() })
            .map<FunctionInfo>(r => r.json());
    }

    getFunction(fi: FunctionInfo) {
        var body: PassthroughInfo = {
            httpMethod: 'GET',
            url: fi.href
        };
        return this._http.post('api/passthrough', JSON.stringify(body), { headers: this.getHeaders() })
            .map<FunctionInfo>(r => r.json());
    }

    getScmUrl() {
        return this.scmInfo.scm_url;
    }

    getBearerHeader() {
        return `Bearer ${this.scmInfo.bearer}`;
    }

    getBasicHeader() {
        return `Basic ${this.scmInfo.basic}`;
    }

    getSubscriptions() {
        return this._http.get('api/subscriptions')
            .map<Subscription[]>(r => r.json());
    }

    getServerFarms() {
        return this._http.get('api/serverfarms')
            .map<ServerFarm[]>(r => r.json());
    }

    private getHeaders(contentType?: string): Headers {
        contentType = contentType || 'application/json';
        var headers = new Headers();
        headers.append('Content-Type', contentType);
        return headers;
    }
}