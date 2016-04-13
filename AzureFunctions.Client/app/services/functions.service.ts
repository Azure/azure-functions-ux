import {Http, Headers} from 'angular2/http';
import {Injectable} from 'angular2/core';
import {FunctionInfo} from '../models/function-info';
import {VfsObject} from '../models/vfs-object';
import {ScmInfo} from '../models/scm-info';
import {PassthroughInfo} from '../models/passthrough-info';
import {CreateFunctionInfo, CreateFunctionInfoV2} from '../models/create-function-info';
import {FunctionTemplate} from '../models/function-template';
import {RunResponse} from '../models/run-response';
import {Observable} from 'rxjs/Rx';
import {DesignerSchema} from '../models/designer-schema';
import {FunctionSecrets} from '../models/function-secrets';
import {Subscription} from '../models/subscription';
import {ServerFarm} from '../models/server-farm';
import {HostSecrets} from '../models/host-secrets';
import {BindingConfig} from '../models/binding';
import {PortalService} from './portal.service';
import {UserService} from './user.service';
import {FunctionContainer} from '../models/function-container';
import {ArmService} from './arm.service';
import {RunFunctionResult} from '../models/run-function-result';

@Injectable()
export class FunctionsService {
    private hostSecrets: HostSecrets;
    private token: string;
    private scmUrl: string;
    private siteName: string;
    private mainSiteUrl: string;
    private appSettings: { [key: string]: string };
    private fc: FunctionContainer;

    // https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
    private statusCodeMap = {
        100: 'Continue',
        101: 'Switching Protocols',
        102: 'Processing',
        200: 'OK',
        201: 'Created',
        202: 'Accepted',
        203: 'Non-Authoritative Information',
        204: 'No Content',
        205: 'Reset Content',
        206: 'Partial Content',
        300: 'Multiple Choices',
        301: 'Moved Permanently',
        302: 'Found',
        303: 'See Other',
        304: 'Not Modified',
        305: 'Use Proxy',
        306: '(Unused)',
        307: 'Temporary Redirect',
        400: 'Bad Request',
        401: 'Unauthorized ',
        402: 'Payment Required',
        403: 'Forbidden',
        404: 'Not Found',
        405: 'Method Not Allowed',
        406: 'Not Acceptable',
        407: 'Proxy Authentication Required',
        408: 'Request Timeout',
        409: 'Conflict',
        410: 'Gone',
        411: 'Length Required',
        412: 'Precondition Failed',
        413: 'Request Entity Too Large',
        414: 'Request-URI Too Long',
        415: 'Unsupported Media Type',
        416: 'Requested Range Not Satisfiable',
        417: 'Expectation Failed',
        500: 'Internal Server Error',
        501: 'Not Implemented',
        502: 'Bad Gateway',
        503: 'Service Unavailable',
        504: 'Gateway Timeout',
        505: 'HTTP Version Not Supported'
    };

    private genericStatusCodeMap = {
        100: 'Informational',
        200: 'Success',
        300: 'Redirection',
        400: 'Client Error',
        500: 'Server Error'
    }

    constructor(
        private _http: Http,
        private _portalService: PortalService,
        private _userService: UserService,
        private _armService: ArmService) {

        this._userService.getToken().subscribe(t => this.token = t);
        this.appSettings = {};
    }

    setFunctionContainer(fc: FunctionContainer) {
        this.scmUrl = `https://${fc.properties.hostNameSslStates.find(s => s.hostType === 1).name}`;
        this.mainSiteUrl = `https://${fc.properties.hostNameSslStates.find(s => s.hostType === 0 && s.name.indexOf('azurewebsites.net') !== -1).name}`;
        this.siteName = fc.name;
        this._armService.getFunctionContainerAppSettings(fc).subscribe(a => this.appSettings = a);
        this.fc = fc;
    }

    getFunctions() {
        return this._http.get(`${this.scmUrl}/api/functions`, { headers: this.getHeaders() })
            .retry(3)
            .map<FunctionInfo[]>(r => r.json());
    }

    getFileContent(file: VfsObject | string) {
        return this._http.get(typeof file === 'string' ? file : file.href, { headers: this.getHeaders() })
            .map<string>(r => r.text());
    }

    saveFile(file: VfsObject | string, updatedContent: string) {
        var headers = this.getHeaders('plain/text');
        headers.append('If-Match', '*');

        return this._http.put(typeof file === 'string' ? file : file.href, updatedContent, { headers: headers })
            .map<VfsObject|string>(r => file);
    }

    getTemplates() {
        return this._http.get('api/templates', { headers: this.getPassthroughHeaders() })
            .map<FunctionTemplate[]>(r => r.json());
    }

    createFunction(functionName: string, templateId: string) {
        if (templateId) {
            var body: CreateFunctionInfo = {
                name: functionName,
                templateId: (templateId && templateId !== 'Empty' ? templateId : null),
                containerScmUrl: this.scmUrl
            };
            return this._http.post('api/createfunction', JSON.stringify(body), { headers: this.getPassthroughHeaders() })
                .map<FunctionInfo>(r => r.json());
        } else {
            return this._http.put(`${this.scmUrl}/api/functions/${functionName}`, JSON.stringify({ config: {} }), { headers: this.getPassthroughHeaders() })
                .map<FunctionInfo>(r => r.json());
        }
    }

    createFunctionV2(functionName: string, files: any) {
        var sampleData = files["sample.dat"];
        delete files["sample.dat"];

        return this._http.put(`${this.scmUrl}/api/functions/${functionName}`, JSON.stringify({ files: files, test_data: sampleData }), { headers: this.getHeaders() })
            .map<FunctionInfo>(r => r.json());
    }

    getNewFunctionNode(): FunctionInfo {
        return {
            name: 'New Function',
            href: null,
            config: null,
            script_href: null,
            template_id: null,
            clientOnly: true,
            isDeleted: false,
            secrets_file_href: null,
            test_data: null
        };
    }

    getSettingsNode(): FunctionInfo {
        return {
            name: "Settings",
            href: null,
            config: null,
            script_href: `${this.scmUrl}/api/vfs/site/wwwroot/host.json`,
            template_id: null,
            clientOnly: true,
            isDeleted: false,
            secrets_file_href: null,
            test_data: null
        };
    }

    private statusCodeToText(code: number) {
        var statusClass = Math.floor(code/100) * 100;
        return this.statusCodeMap[code] || this.genericStatusCodeMap[statusClass] || 'Unknown Status Code';
    }

    runFunction(functionInfo: FunctionInfo, content: string) {
        var inputBinding = (functionInfo.config && functionInfo.config.bindings
            ? functionInfo.config.bindings.find(e => e.type === 'httpTrigger')
            : null);

        var url = inputBinding
            ? `${this.mainSiteUrl}/api/${functionInfo.name.toLocaleLowerCase()}`
            : `${this.mainSiteUrl}/admin/functions/${functionInfo.name.toLocaleLowerCase()}`;

        var _content: string = inputBinding
            ? content
            : JSON.stringify({ input: content });

        var contentType: string;
        if (!inputBinding || inputBinding && inputBinding.webHookType) {
            contentType = 'application/json';
        } else {
            try {
                var temp = JSON.parse(_content);
                contentType = 'application/json';
            } catch (e) {
                contentType = 'plain/text';
            }
        }

        return this._http.post(url, _content, { headers: this.getMainSiteHeaders(contentType) })
            .catch(e => Observable.of({ status: e.status, statusText: this.statusCodeToText(e.status), text: () => e._body }))
            .map<RunFunctionResult>(r => ({ statusCode: r.status, statusText: this.statusCodeToText(r.status), content: r.text() }));
    }

    deleteFunction(functionInfo: FunctionInfo) {
        return this._http.delete(functionInfo.href, { headers: this.getHeaders() })
            .map<string>(r => r.statusText);
    }

    getDesignerSchema() {
        return this._http.get('mocks/function-json-schema.json')
            .map<DesignerSchema>(r => r.json());
    }

    warmupMainSite() {
        var body: PassthroughInfo = {
            httpMethod: 'GET',
            url: this.scmUrl.replace('.scm.', '.')
        };
        var observable = this._http.get(this.mainSiteUrl, { headers: this.getHeaders() })
            .map<string>(r => r.statusText);

        observable.subscribe(() => this.getHostSecrets(), () => this.getHostSecrets());
        return observable;
    }

    getSecrets(fi: FunctionInfo) {
        return this._http.get(fi.secrets_file_href, { headers: this.getHeaders() })
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
        return `${this.scmUrl.replace('.scm.', '.')}/api/${fi.name}`;
    }

    saveFunction(fi: FunctionInfo, config: any) {
        return this._http.put(fi.href, JSON.stringify({config: config}), { headers: this.getHeaders() })
            .map<FunctionInfo>(r => r.json());
    }

    getFunction(fi: FunctionInfo) {
        return this._http.get(fi.href, { headers: this.getHeaders() })
            .map<FunctionInfo>(r => r.json());
    }

    getScmUrl() {
        return this.scmUrl;
    }

    getSiteName(){
        return this.siteName;
    }

    getDefaultStorageAccount() {
        for (var key in this.appSettings) {
            if (key.toString().endsWith("_STORAGE")) {
                return key;
            }
        }

        return "";
    }

    getConfig() {
        return this._armService.getConfig(this.fc);
    }

    getHostSecrets() {
        return this._http.get(`${this.scmUrl}/api/vfs/data/functions/secrets/host.json`, { headers: this.getHeaders() })
            .retryWhen(errors => errors.delay(100))
            .map<HostSecrets>(r => r.json())
            .subscribe(h => this.hostSecrets = h, e => console.log(e));
    }

    getBindingConfig(): Observable<BindingConfig> {
        return this._http.get('api/bindingconfig', { headers: this.getPassthroughHeaders() })
            .map<BindingConfig>(r => r.json());;
    }

    get HostSecrets() {
        return this.hostSecrets;
    }

    createTrialFunctionsContainer() {
        return this._http.post('api/createtrial', '', { headers: this.getPassthroughHeaders() })
            .map<string>(r => r.statusText);
    }

    updateFunction(fi: FunctionInfo) {
        return this._http.put(fi.href, JSON.stringify(fi), { headers: this.getHeaders() })
            .map<FunctionInfo>(r => r.json());
    }

    getFunctionErrors(fi: FunctionInfo) {
        return this._http.get(`${this.mainSiteUrl}/admin/functions/${fi.name}/status`, { headers: this.getMainSiteHeaders() })
            .map<string[]>(r => r.json().errors || []);
    }

    getHostErrors() {
        return this._http.get(`${this.mainSiteUrl}/admin/host/status`, { headers: this.getMainSiteHeaders() })
            .map<string[]>(r => r.json().errors || []);
    }

    private getHeaders(contentType?: string): Headers {
        contentType = contentType || 'application/json';
        var headers = new Headers();
        headers.append('Content-Type', contentType);
        headers.append('Accept', 'application/json,*/*');

        if (this.token) {
            headers.append('Authorization', `Bearer ${this.token}`);
        }

        return headers;
    }

    private getMainSiteHeaders(contentType?: string): Headers {
        contentType = contentType || 'application/json';
        var headers = new Headers();
        headers.append('Content-Type', contentType);
        headers.append('Accept', 'application/json,*/*');
        if (this.hostSecrets) {
            headers.append('x-functions-key', this.hostSecrets.masterKey);
        }
        return headers;
    }

    private getPassthroughHeaders(contentType?: string): Headers {
        contentType = contentType || 'application/json';
        var headers = new Headers();
        headers.append('Content-Type', contentType);
        headers.append('Accept', 'application/json,*/*');

        if (this.token) {
            headers.append('client-token', this.token);
            headers.append('portal-token', this.token);
        }

        return headers;
    }
}