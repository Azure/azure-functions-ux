import { KeyCodes, Constants } from './../../shared/models/constants';
import { BusyStateScopeManager } from './../../busy-state/busy-state-scope-manager';
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/zip';
import { TranslateService } from '@ngx-translate/core';

import { BusyStateComponent } from './../../busy-state/busy-state.component';
import { SwaggerEditor } from '../swagger-frame/swaggerEditor';
import { AiService } from '../../shared/services/ai.service';
import { SelectOption } from '../../shared/models/select-option';
import { PortalService } from '../../shared/services/portal.service';
import { PortalResources } from '../../shared/models/portal-resources';
import { BroadcastService } from '../../shared/services/broadcast.service';
import { errorIds } from '../../shared/models/error-ids';
import { CacheService } from '../../shared/services/cache.service';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { FunctionAppContextComponent } from 'app/shared/components/function-app-context-component';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'swaggerdefinition',
    templateUrl: './swagger-definition.component.html',
    styleUrls: ['./swagger-definition.component.scss']
})
export class SwaggerDefinitionComponent extends FunctionAppContextComponent implements OnDestroy {
    @ViewChild(BusyStateComponent) busyState: BusyStateComponent;
    public isFullscreen: boolean;
    public keyVisible: boolean;
    public documentationVisible: boolean;
    public swaggerEnabled: boolean;

    public swaggerStatusOptions: SelectOption<boolean>[];
    public valueChange: Subject<boolean>;
    public swaggerKey: string;
    public swaggerURL: string;

    private swaggerEditor: SwaggerEditor;
    private swaggerDocument: any;

    private _ngUnsubscribe = new Subject();
    private _busyManager: BusyStateScopeManager;

    constructor(private _aiService: AiService,
        private _portalService: PortalService,
        private _cacheService: CacheService,
        broadcastService: BroadcastService,
        private _translateService: TranslateService,
        private _functionAppService: FunctionAppService) {
        super('swagger-definition', _functionAppService, broadcastService, () => this._busyManager.setBusy());

        this._busyManager = new BusyStateScopeManager(broadcastService, 'site-tabs');
        this.swaggerStatusOptions = [
            {
                displayLabel: this._translateService.instant(PortalResources.swaggerDefinition_internal),
                value: true
            },
            {
                displayLabel: this._translateService.instant(PortalResources.swaggerDefinition_external),
                value: false
            }];

        this.valueChange = new Subject<boolean>();
        this.valueChange
            .subscribe((swaggerEnabled: boolean) => {
                this._busyManager.setBusy();
                if (this.swaggerEnabled === swaggerEnabled) {
                    this._busyManager.clearBusy();
                } else {
                    this.swaggerEnabled = swaggerEnabled;
                    this.setSwaggerEndpointState(swaggerEnabled)
                        .subscribe(() => {
                            this.clearBusyState();
                        });
                }
            });
    }

    setup(): Subscription {
        return this.viewInfoEvents
            .switchMap(viewInfo => this._functionAppService.getHostJson(this.context))
            .switchMap(jsonObj => {
                this.swaggerEnabled = false;
                if (jsonObj && jsonObj.result.swagger && typeof (jsonObj.result.swagger.enabled) === 'boolean') {
                    this.swaggerEnabled = jsonObj.result.swagger.enabled;
                }

                if (this.swaggerEnabled) {
                    return this.restoreSwaggerSecrets();
                } else {
                    this.swaggerEnabled = false;
                    return Observable.of('');
                }
            })
            .do(null, () => {
                this.swaggerEnabled = false;
                return Observable.of('');
            })
            .mergeMap(key => {
                // global busy state
                this._busyManager.clearBusy();
                this._aiService.stopTrace('/timings/site/tab/api-definition/revealed', this.viewInfo.data.siteTabRevealedTraceKey);

                // busy state for Editor Section
                this.setBusyState();

                if (!key) {
                    const placeHolderText = this._translateService.instant(PortalResources.swaggerDefinition_placeHolder);
                    this.assignDocumentToEditor(placeHolderText);
                    return Observable.of(false);
                } else {
                    return this.loadLatestSwaggerDocumentInEditor(key);
                }
            })
            .do(null, () => {
                this.swaggerEnabled = false;
                return Observable.of(this.swaggerEnabled);
            })
            .subscribe(() => {
                this.clearBusyState();
                this._aiService.stopTrace('/timings/site/tab/api-definition/full-ready', this.viewInfo.data.siteTabFullReadyTraceKey);
            });
    }

    setBusyState() {
        if (this.busyState) {
            this.busyState.setBusyState();
        }
    }

    clearBusyState() {
        if (this.busyState) {
            this.busyState.clearBusyState();
        }
    }

    ngOnDestroy() {
        this._ngUnsubscribe.next();
        this._busyManager.clearBusy();
    }

    openBlade(name: string) {
        this._portalService.openBlade({
            detailBlade: name,
            detailBladeInputs: { resourceUri: this.context.site.id }
        }, name);
    }

    apiDefinitionKeyDown(event: KeyboardEvent) {
        if (event.keyCode === KeyCodes.enter || event.keyCode === KeyCodes.space) {
            console.log(event.keyCode);
            this.toggleKeyVisibility();
        }
    }

    apiDefinitionSourceKeyDown(event: KeyboardEvent) {
        if (event.keyCode === KeyCodes.enter || event.keyCode === KeyCodes.space) {
            this.valueChange.next(!this.swaggerEnabled);
        }
    }

    renewKeyDown(event: KeyboardEvent) {
        if (event.keyCode === KeyCodes.enter || event.keyCode === KeyCodes.space) {
            this.renewSwaggerSecret();
        }
    }

    documentKeyDown(event: KeyboardEvent) {
        if (event.keyCode === KeyCodes.enter || event.keyCode === KeyCodes.space) {
            console.log(event.keyCode);
            this.toggleDocumentationVisibility();
        }
    }

    expandCollapseKeyDown(event: KeyboardEvent) {
        if (event.keyCode === KeyCodes.enter || event.keyCode === KeyCodes.space) {
            this.isFullscreen = !this.isFullscreen;
        }
    }

    private setSwaggerEndpointState(swaggerEnabled: boolean) {
        return this._functionAppService.getHostJson(this.context)
            .concatMap(jsonObj => {
                if (jsonObj.isSuccessful) {
                    jsonObj.result.swagger = { enabled: swaggerEnabled };
                    const jsonString = JSON.stringify(jsonObj.result);
                    return this._functionAppService.saveHostJson(this.context, jsonString);
                } else {
                    return Observable.of({
                        isSuccessful: false,
                        error: {
                            errorId: ''
                        },
                        result: null
                    });
                }
            })
            .concatMap(config => {
                if (!config.isSuccessful) {
                    this.swaggerEnabled = !swaggerEnabled;
                    return Observable.of('');
                }
                this.swaggerEnabled = config.result.swagger.enabled;
                if (!this.swaggerEnabled) {
                    this._aiService.trackEvent(`/actions/swagger_definition/disable_swagger_endpoint`);
                    return Observable.of('');
                } else {
                    this._aiService.trackEvent(`/actions/swagger_definition/enable_swagger_endpoint`);
                    return this.restoreSwaggerSecrets();
                }
            }).do(null, () => {
                this.swaggerEnabled = false;
            })
            .mergeMap(key => {
                // global busy state
                this._busyManager.clearBusy();

                // busy state for Editor Section
                this.setBusyState();
                if (!key) {
                    const placeHolderText = this._translateService.instant(PortalResources.swaggerDefinition_placeHolder);
                    this.assignDocumentToEditor(placeHolderText);
                    return Observable.of(false);
                } else {
                    return this.loadLatestSwaggerDocumentInEditor(key);
                }
            }).do(null, () => {
                this.swaggerEnabled = false;
            });
    }

    public onSwaggerEditorReady(swaggerEditor: SwaggerEditor): void {
        this.swaggerEditor = swaggerEditor;
        if (!this.swaggerEditor) {
            return;
        }

        if (!this.swaggerDocument) {
            this.swaggerDocument = this._translateService.instant(PortalResources.swaggerDefinition_placeHolder);
        }

        this.swaggerEditor.setDocument(this.swaggerDocument);
    }

    private assignDocumentToEditor(swaggerDocument) {
        if (this.swaggerEditor) {
            this.swaggerEditor.setDocument(swaggerDocument);
        }
    }
    public LoadGeneratedDataInEditor() {
        this.swaggerEditor.getDocument((swaggerDocument, error) => {
            if (((!swaggerDocument || swaggerDocument === this._translateService.instant(PortalResources.swaggerDefinition_placeHolder))
                && !error)
                || confirm(this._translateService.instant(PortalResources.swaggerDefinition_confirmOverwrite))) {
                this._functionAppService.getGeneratedSwaggerData(this.context)
                    .subscribe((swaggerDoc: any) => {
                        this.swaggerDocument = swaggerDoc;
                        this.assignDocumentToEditor(swaggerDoc);
                    });
            }
        });
    }

    public toggleKeyVisibility(): void {
        this.keyVisible = !this.keyVisible;
    }

    public toggleDocumentationVisibility(): void {
        this.documentationVisible = !this.documentationVisible;
    }

    public saveChanges(): void {
        this._busyManager.setBusy();
        this.swaggerEditor.getDocument((swaggerDocument, error) => {
            if (error) {
                this.showComponentError({
                    message: this._translateService.instant(PortalResources.swaggerDefinition_prompt),
                    errorId: errorIds.malformedAPIDefinition,
                    resourceId: this.context.site.id
                });

                this._busyManager.clearBusy();
                return;
            }

            if (swaggerDocument) {
                this._cacheService.clearCachePrefix(this.swaggerURL);
                this._functionAppService.addOrUpdateSwaggerDocument(this.context, this.swaggerURL, swaggerDocument)
                    .subscribe(updatedDocument => {
                        this.swaggerDocument = updatedDocument;
                        this._busyManager.clearBusy();
                    }, () => {
                        this._busyManager.clearBusy();
                    });
                return;
            }

            if (!swaggerDocument && !error) {
                const confirmDelete = confirm(this._translateService.instant(PortalResources.swaggerDefinition_delete));
                if (confirmDelete) {
                    this._functionAppService.deleteSwaggerDocument(this.context, this.swaggerURL)
                        .subscribe(() => {
                            this.swaggerDocument = this._translateService.instant(PortalResources.swaggerDefinition_placeHolder);
                            this._busyManager.clearBusy();
                        }, () => {
                            this._busyManager.clearBusy();
                        });
                } else {
                    this.assignDocumentToEditor(this.swaggerDocument);
                    this._busyManager.clearBusy();
                }
                return;
            }
        });
    }

    public resetEditor(): void {
        this._busyManager.setBusy();
        this._functionAppService.getSwaggerDocument(this.context)
            .subscribe((swaggerDoc: any) => {
                this.swaggerDocument = swaggerDoc;
                this.assignDocumentToEditor(swaggerDoc);
                this._busyManager.clearBusy();
            }, () => {
                this._busyManager.clearBusy();
            });
    }

    public renewSwaggerSecret() {
        this._busyManager.setBusy();
        this.createSwaggerSecret()
            .mergeMap(key => {
                this.swaggerKey = key;
                this.swaggerURL = this.getUpdatedSwaggerURL(key);
                return this.addorUpdateApiDefinitionURL(this.swaggerURL);
            })
            .catch(() => {
                return Observable.of(false);
            }).subscribe(() => {
                this._busyManager.clearBusy();
            });
    }

    private addorUpdateApiDefinitionURL(url: string) {
        return this._cacheService.getArm(`${this.context.site.id}/config/web`, true)
            .map(r => r.json())
            .mergeMap(config => {
                let configChange = false;

                if (!config.properties.apiDefinition ||
                    !config.properties.apiDefinition.url ||
                    config.properties.apiDefinition.url !== url) {
                    config.properties.apiDefinition = { url: url };
                    configChange = true;
                }

                if (!config.properties.cors.allowedOrigins.includes('*')) {
                    if (!config.properties.cors.allowedOrigins.includes(Constants.portalHostName)) {
                        config.properties.cors.allowedOrigins.push(Constants.portalHostName);
                        configChange = true;
                    }

                    if (!config.properties.cors.allowedOrigins.includes(Constants.webAppsHostName)) {
                        config.properties.cors.allowedOrigins.push(Constants.webAppsHostName);
                        configChange = true;
                    }

                    if (!config.properties.cors.allowedOrigins.includes(Constants.msPortalHostName)) {
                        config.properties.cors.allowedOrigins.push(Constants.msPortalHostName);
                        configChange = true;
                    }
                }

                if (configChange) {
                    return this._cacheService.putArm(`${this.context.site.id}/config/web`, null, JSON.stringify(config)).map(r => r.json());
                }

                return Observable.of(true);
            });
    }

    private getSwaggerSecret() {
        return this._functionAppService.getSystemKey(this.context)
            .map(keys => {
                let swaggerKey: string = null;
                keys.result.keys.forEach(key => {
                    if (key.name === Constants.swaggerSecretName) {
                        swaggerKey = key.value;
                    }
                });
                return swaggerKey;
            });
    }

    private getUpdatedSwaggerURL(key: string) {
        return this.context.mainSiteUrl + '/admin/host/swagger?code=' + key;
    }

    private createSwaggerSecret() {
        return this._functionAppService.createSystemKey(this.context, Constants.swaggerSecretName)
            .map(key => { return key.result.value; });
    }

    private restoreSwaggerSecrets() {
        return this.getSwaggerSecret()
            .mergeMap(key => {
                if (!key) {
                    return this.createSwaggerSecret();
                }
                return Observable.of(key);
            }).catch(() => {
                // get or create key fails
                this.swaggerEnabled = false;
                return Observable.of('');
            }).mergeMap(key => {
                if (key) {
                    this.swaggerKey = key;
                }
                return Observable.of(key);
            });
    }

    private loadLatestSwaggerDocumentInEditor(key) {
        this.swaggerURL = this.getUpdatedSwaggerURL(key);
        return this._functionAppService.getSwaggerDocument(key)
            .retry(1)
            .catch(() => {
                // get document fails
                return Observable.of(this._translateService.instant(PortalResources.swaggerDefinition_placeHolder));
            }).mergeMap(swaggerDoc => {
                this.swaggerDocument = swaggerDoc;
                this.assignDocumentToEditor(swaggerDoc);
                if (this.swaggerKey) {
                    return this.addorUpdateApiDefinitionURL(this.swaggerURL);
                }
                return Observable.of(true);
            }).catch(() => {
                return Observable.of(false);
            });
    }
}
