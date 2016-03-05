import {Http, Headers} from 'angular2/http';
import {Injectable} from 'angular2/core';
import {FunctionInfo} from '../models/function-info';
import {VfsObject} from '../models/vfs-object';
import {ScmInfo} from '../models/scm-info';
import {PassthroughInfo} from '../models/passthrough-info';
import {CreateFunctionInfo} from '../models/create-function-info';
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

@Injectable()
export class FunctionsService implements IFunctionsService {
    private scmInfo: ScmInfo;
    private hostSecrets: HostSecrets;

    constructor(private _http: Http, private _portalService: PortalService) { }
    
    setToken(token : string) : void{
        this.scmInfo = <ScmInfo>{
            bearerPortal: token
        };
    }

    initializeUser() {
        var url = 'api/get';
        if (this._portalService.inIFrame) {
            url = `api/get${this._portalService.resourceId}`;
        } else if (window.location.pathname !== '/') {
            url = `api/get${window.location.pathname}`;
        }

        return this._http.get(url, { headers: this.getHeaders() })
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

    redirectToIbizaIfNeeded() {
        if (!this._portalService.inIFrame &&
            window.location.hostname !== "localhost" &&
            window.location.search.indexOf("ibiza=disabled") === -1 &&
            this.scmInfo &&
            this.scmInfo.armId) {
            var url = 'https://portal.azure.com/?feature.canmodifystamps=true&BizTalkExtension=canary&Microsoft_Azure_Microservices=canary&WebsitesExtension=canary&ClearDBExtension=canary&websitesextension_cloneapp=true&HubsExtension_ItemHideKey=GalleryApplicationTesting&websitesextension_functions=true#resource';
            window.location.replace(`${url}${this.scmInfo.armId}`);
        }
    }

    createFunctionsContainer(subscriptionId: string, region: string, serverFarmId?: string) {
        var serverFarmQuery = serverFarmId ? `&serverFarmId=${serverFarmId}` : '';
        return this._http.post(`api/create?subscriptionId=${subscriptionId}&location=${region}${serverFarmQuery}`, '', { headers: this.getHeaders() })
            .catch(e => {
                if (e.status === 500) {
                    return this.createFunctionsContainer(subscriptionId, region, serverFarmId).map(r => ({ json: () => r }));
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
            var passthrowBody: PassthroughInfo = {
                httpMethod: "PUT",
                url: `${this.scmInfo.scm_url}/api/functions/${functionName}`,
                requestBody: { config: {} }
            };
            return this._http.post('api/passthrough', JSON.stringify(passthrowBody), { headers: this.getHeaders() })
                .map<FunctionInfo>(r => r.json());
        }
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
            ? 'plain/text'
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

    getHostSecrets() {
        var body: PassthroughInfo = {
            httpMethod: 'GET',
            url: `${this.scmInfo.scm_url}/api/vfs/data/functions/secrets/host.json`
        };
        return this._http.post('api/passthrough', JSON.stringify(body), { headers: this.getHeaders() })
            .map<HostSecrets>(r => r.json())
            .subscribe(h => this.hostSecrets = h,
                       e => { if (e.status === 404) { this.getHostSecrets(); } });
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
        var body: PassthroughInfo = {
            httpMethod: "PUT",
            url: fi.href,
            requestBody: fi
        };
        return this._http.post('api/passthrough', JSON.stringify(body), { headers: this.getHeaders() })
            .map<FunctionInfo>(r => r.json());
    }

    private getHeaders(contentType?: string): Headers {
        contentType = contentType || 'application/json';
        var headers = new Headers();
        headers.append('Content-Type', contentType);

        if(this.scmInfo && this.scmInfo.bearer){
            headers.append('client-token', this.scmInfo.bearer);
        }

        if (this.scmInfo && this.scmInfo.bearerPortal) {
            headers.append('portal-token', this.scmInfo.bearerPortal);
        }

        return headers;
    }
}