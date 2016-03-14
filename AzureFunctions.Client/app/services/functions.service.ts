import {Http, Headers} from 'angular2/http';
import {Injectable} from 'angular2/core';
import {FunctionInfo} from '../models/function-info';
import {VfsObject} from '../models/vfs-object';
import {ScmInfo} from '../models/scm-info';
import {PassthroughInfo} from '../models/passthrough-info';
import {CreateFunctionInfo, CreateFunctionInfoV2} from '../models/create-function-info';
import {IFunctionsService} from './ifunctions.service';
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

@Injectable()
export class FunctionsService implements IFunctionsService {
    private scmInfo: ScmInfo;
    private hostSecrets: HostSecrets;

    constructor(
        private _http: Http,
        private _portalService: PortalService,
        private _userService: UserService) { }
    
    setToken(token : string) : void{
        this.scmInfo = <ScmInfo>{
            bearerPortal: token
        };
    }

    isInitialized(){
        return this.scmInfo && this.scmInfo.scm_url;
    }

    initializeUser(armId?: string) {
        var url = 'api/get';
        if (this._portalService.inIFrame) {
            url = `api/get${this._portalService.resourceId}`;
        } else if (armId) {
            url = `api/get${armId}`;
        } else if (window.location.pathname !== '/') {
            url = `api/get${window.location.pathname}`;
        }

        return this._http.get(url, { headers: this.getHeaders() })
            .map<ScmInfo>(r => {
                var response: ScmInfo = r.json();

                if (this.scmInfo) {
                    response.bearerPortal = this.scmInfo.bearerPortal;
                }

                this.scmInfo = response;
                return this.scmInfo;
            });
    }

    redirectToIbizaIfNeeded() {
        if (!this._portalService.inIFrame &&
            window.location.hostname !== "localhost" &&
            window.location.search.indexOf("ibiza=disabled") === -1 &&
            this.scmInfo &&
            this.scmInfo.armId) {
            this._userService.getTenants()
                .subscribe(tenants => {
                    var currentTenant = tenants.find(t => t.Current);
                    var portalHostName = 'https://portal.azure.com';
                    var query = `?feature.canmodifystamps=true&BizTalkExtension=canary&Microsoft_Azure_Microservices=canary&WebsitesExtension=canary&ClearDBExtension=canary&websitesextension_cloneapp=true&HubsExtension_ItemHideKey=GalleryApplicationTesting`;
                    var environment = window.location.host.indexOf('staging') === -1
                        ? '&websitesextension_functions=true' // production
                        : '&websitesextension_functionsstaged=true'; // staging
                    window.location.replace(`${portalHostName}/${currentTenant.DomainName}${query}${environment}#resource${this.scmInfo.armId}`);
                });
        }
    }

    getFunctions() {
        return this._http.get(`${this.scmInfo.scm_url}/api/functions`, { headers: this.getHeaders() })
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
        return this._http.get('api/templates', { headers: this.getHeaders() })
            .map<FunctionTemplate[]>(r => r.json());
    }

    createFunction(functionName: string, templateId: string) {
        if (templateId) {
            var body: CreateFunctionInfo = {
                name: functionName,
                templateId: (templateId && templateId !== 'Empty' ? templateId : null),
                containerScmUrl: this.scmInfo.scm_url
            };
            return this._http.post('api/createfunction', JSON.stringify(body), { headers: this.getHeaders() })
                .map<FunctionInfo>(r => r.json());
        } else {
            return this._http.put(`${this.scmInfo.scm_url}/api/functions/${functionName}`, JSON.stringify({config: {}}), { headers: this.getHeaders() })
                .map<FunctionInfo>(r => r.json());
        }
    }

    createFunctionV2(functionName: string, files: any) {
        var body: CreateFunctionInfoV2 = {
            name: functionName,
            containerScmUrl: this.scmInfo.scm_url,
            files: files
        };
        return this._http.post('api/createfunctionv2', JSON.stringify(body), { headers: this.getHeaders() })
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

    getTestData(functionInfo: FunctionInfo) {
        return this._http.get(functionInfo.test_data_href, { headers: this.getHeaders() })
            .catch(e => Observable.of({
                text: () => ''
            }))
            .map<string>(r => r.text());
    }

    runFunction(functionInfo: FunctionInfo, content: string) {
        var mainSiteUrl = this.scmInfo.scm_url.replace('.scm.', '.');

        var inputBinding = (functionInfo.config && functionInfo.config.bindings
            ? functionInfo.config.bindings.find(e => e.type === 'httpTrigger')
            : null);

        var url = inputBinding
            ? `${mainSiteUrl}/api/${functionInfo.name.toLocaleLowerCase()}`
            : `${mainSiteUrl}/admin/functions/${functionInfo.name.toLocaleLowerCase()}`;

        var _content: any = inputBinding
            ? content
            : { input: content };

        var mediaType = inputBinding
            ? (inputBinding.webHookType ? 'application/json' : 'plain/text')
            : 'application/json';


        var body: PassthroughInfo = {
            httpMethod: 'POST',
            url: url,
            requestBody: _content,
            mediaType: mediaType,
            headers: {
                'x-functions-key': this.hostSecrets.masterKey
            }
        };
        return this._http.post('api/passthrough', JSON.stringify(body), { headers: this.getHeaders() })
            .catch(e => Observable.of({
                text: () => JSON.stringify(e)
            }))
            .map<string>(r => r.text());
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
            url: this.scmInfo.scm_url.replace('.scm.', '.')
        };
        this._http.post('api/passthrough', JSON.stringify(body), { headers: this.getHeaders() })
            .subscribe(() => { }, e => { if (e.status === 503 || e.status === 403) { this.warmupMainSite(); } else { this.warmupMainSiteApi(); this.getHostSecrets(); } });
    }

    warmupMainSiteApi() {
        var body: PassthroughInfo = {
            httpMethod: 'GET',
            url: `${this.scmInfo.scm_url.replace('.scm.', '.')}/api/`
        };
        this._http.post('api/passthrough', JSON.stringify(body), { headers: this.getHeaders() })
            .subscribe(() => { }, e => { if (e.status === 503 || e.status === 403) { this.warmupMainSiteApi(); } });
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
        return `${this.scmInfo.scm_url.replace('.scm.', '.')}/api/${fi.name}`;
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
        return this.scmInfo.scm_url;
    }

    getBearerHeader() {
        return `Bearer ${this.scmInfo.bearer}`;
    }

    getBasicHeader() {
        return `Basic ${this.scmInfo.basic}`;
    }

    getHostSecrets() {
        return this._http.get(`${this.scmInfo.scm_url}/api/vfs/data/functions/secrets/host.json`, { headers: this.getHeaders() })
            .retry(3)
            .map<HostSecrets>(r => r.json())
            .subscribe(h => this.hostSecrets = h, e => console.log(e));
    }

    getBindingConfig(): Observable<BindingConfig> {
        return this._http.get('api/bindingconfig', { headers: this.getHeaders() })
            .map<BindingConfig>(r => r.json());;
    }

    get HostSecrets() {
        return this.hostSecrets;
    }

    createTrialFunctionsContainer() {
        return this._http.post('api/createtrial', '', { headers: this.getHeaders() })
            .map<string>(r => r.statusText);
    }

    updateFunction(fi: FunctionInfo) {
        return this._http.put(fi.href, JSON.stringify(fi), { headers: this.getHeaders() })
            .map<FunctionInfo>(r => r.json());
    }

    private getHeaders(contentType?: string): Headers {
        contentType = contentType || 'application/json';
        var headers = new Headers();
        headers.append('Content-Type', contentType);

        if(this.scmInfo && this.scmInfo.bearer){
            headers.append('client-token', this.scmInfo.bearer);
            headers.append('Authorization', `Bearer ${this.scmInfo.bearer}`);
        }

        if (this.scmInfo && this.scmInfo.bearerPortal) {
            headers.append('portal-token', this.scmInfo.bearerPortal);
            headers.append('Authorization', `Bearer ${this.scmInfo.bearerPortal}`);
        }

        return headers;
    }
}