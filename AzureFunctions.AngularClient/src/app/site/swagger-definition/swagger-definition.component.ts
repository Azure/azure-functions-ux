import { SiteTabComponent } from './../site-dashboard/site-tab/site-tab.component';
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
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
import { Constants } from '../../shared/models/constants';
import { PortalResources } from '../../shared/models/portal-resources';
import { BroadcastService } from '../../shared/services/broadcast.service';
import { BroadcastEvent } from '../../shared/models/broadcast-event';
import { ErrorIds } from '../../shared/models/error-ids';
import { ErrorEvent, ErrorType } from '../../shared/models/error-event';
import { FunctionApp } from '../../shared/function-app';
import { CacheService } from '../../shared/services/cache.service';
import { TreeViewInfo, SiteData } from './../../tree-view/models/tree-view-info';
import { AppNode } from './../../tree-view/app-node';
import { ArmObj } from './../../shared/models/arm/arm-obj';
import { Site } from './../../shared/models/arm/site';

@Component({
    selector: 'swaggerdefinition',
    templateUrl: './swagger-definition.component.html',
    styleUrls: ['./swagger-definition.component.scss'],
    inputs: ['viewInfoInput']
})
export class SwaggerDefinitionComponent implements OnDestroy {
    @ViewChild(BusyStateComponent) busyState: BusyStateComponent;
    public isFullscreen: boolean;
    public keyVisible: boolean;
    public documentationVisible: boolean;
    public swaggerEnabled: boolean;

    public site: ArmObj<Site>;
    public functionApp: FunctionApp;

    public swaggerStatusOptions: SelectOption<boolean>[];
    public valueChange: Subject<boolean>;
    public swaggerKey: string;
    public swaggerURL: string;

    private swaggerEditor: SwaggerEditor;
    private swaggerDocument: any;


    private _viewInfoStream = new Subject<TreeViewInfo<SiteData>>();
    private _viewInfoSub: RxSubscription;
    private _viewInfo: TreeViewInfo<SiteData>;
    private _appNode: AppNode;
    private _busyState: BusyStateComponent;

    constructor(private _aiService: AiService,
        private _portalService: PortalService,
        private _cacheService: CacheService,
        private _broadcastService: BroadcastService,
        private _translateService: TranslateService,
        siteTabComponent: SiteTabComponent
    ) {
        this._busyState = siteTabComponent.busyState;

        this._viewInfoSub = this._viewInfoStream
            .switchMap(viewInfo => {
                this._viewInfo = viewInfo;
                this._busyState.setBusyState();

                this._appNode = (<AppNode>viewInfo.node);

                return Observable.zip(
                    this._cacheService.getArm(viewInfo.resourceId),
                    this._appNode.functionAppStream,
                    (s: Response, fa: FunctionApp) => ({ siteResponse: s, functionApp: fa }));
            })
            .switchMap(r => {
                this.functionApp = r.functionApp;
                this.site = r.siteResponse.json();
                return this.functionApp.getHostJson();
            })
            .do(null, e => {
                this._aiService.trackException(e, 'swagger-definition');
                this.swaggerEnabled = false;
                this._busyState.clearBusyState();
            })
            .retry()
            .mergeMap(jsonObj => {
                this.swaggerEnabled = false;
                if (jsonObj && jsonObj.swagger && typeof (jsonObj.swagger.enabled) === 'boolean') {
                    this.swaggerEnabled = jsonObj.swagger.enabled;
                }

                if (this.swaggerEnabled) {
                    return this.restoreSwaggerSecrets();
                } else {
                    this.swaggerEnabled = false;
                    return Observable.of('');
                }
            }).do(null, () => {
                this.swaggerEnabled = false;
                return Observable.of('');
            })
            .mergeMap(key => {
                // global busy state
                this._busyState.clearBusyState();
                this._aiService.stopTrace('/timings/site/tab/api-definition/revealed', this._viewInfo.data.siteTabRevealedTraceKey);

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
                return Observable.of(this.swaggerEnabled);
            }).subscribe(() => {
                this.clearBusyState();
                this._aiService.stopTrace('/timings/site/tab/api-definition/full-ready', this._viewInfo.data.siteTabFullReadyTraceKey);
            });

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
                this._busyState.setBusyState();
                if (this.swaggerEnabled === swaggerEnabled) {
                    this._busyState.clearBusyState();
                } else {
                    this.swaggerEnabled = swaggerEnabled;
                    this.setSwaggerEndpointState(swaggerEnabled)
                        .subscribe(() => {
                            this.clearBusyState();
                        });
                }
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

    set viewInfoInput(viewInfo: TreeViewInfo<SiteData>) {
        this._viewInfoStream.next(viewInfo);
    }

    ngOnDestroy() {
        if (this._viewInfoSub) {
            this._viewInfoSub.unsubscribe();
            this._viewInfoSub = null;
        }

        this._busyState.clearBusyState();
    }

    openBlade(name: string) {
        this._portalService.openBlade({
            detailBlade: name,
            detailBladeInputs: { resourceUri: this.functionApp.site.id }
        }, name);
    }

    private setSwaggerEndpointState(swaggerEnabled: boolean) {
        return this.functionApp.getHostJson()
            .mergeMap(jsonObj => {
                jsonObj.swagger = { enabled: swaggerEnabled };
                const jsonString = JSON.stringify(jsonObj);
                return this.functionApp.saveHostJson(jsonString);
            }).catch(() => {
                this._busyState.clearBusyState();
                return Observable.of(null);
            }).mergeMap(config => {
                if (config == null) {
                    this.swaggerEnabled = !swaggerEnabled;
                    return Observable.of('');
                }
                this.swaggerEnabled = config.swagger.enabled;
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
                this._busyState.clearBusyState();

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
                this.functionApp.getGeneratedSwaggerData(this.swaggerKey)
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
        this._busyState.setBusyState();
        this.swaggerEditor.getDocument((swaggerDocument, error) => {
            if (error) {
                this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                    message: this._translateService.instant(PortalResources.swaggerDefinition_prompt),
                    errorId: ErrorIds.malformedAPIDefinition,
                    errorType: ErrorType.UserError,
                    resourceId: this.functionApp.site.id
                });
                this._busyState.clearBusyState();
                return;
            }

            if (swaggerDocument) {
                this.functionApp.addOrUpdateSwaggerDocument(this.swaggerURL, swaggerDocument).
                    subscribe(updatedDocument => {
                        this.swaggerDocument = updatedDocument;
                        this._busyState.clearBusyState();
                    }, () => {
                        this._busyState.clearBusyState();
                    });
                return;
            }

            if (!swaggerDocument && !error) {
                const confirmDelete = confirm(this._translateService.instant(PortalResources.swaggerDefinition_delete));
                if (confirmDelete) {
                    this.functionApp.deleteSwaggerDocument(this.swaggerURL).
                        subscribe(() => {
                            this.swaggerDocument = this._translateService.instant(PortalResources.swaggerDefinition_placeHolder);
                            this._busyState.clearBusyState();
                        }, () => {
                            this._busyState.clearBusyState();
                        });
                } else {
                    this.assignDocumentToEditor(this.swaggerDocument);
                    this._busyState.clearBusyState();
                }
                return;
            }
        });
    }

    public resetEditor(): void {
        this._busyState.setBusyState();
        this.functionApp.getSwaggerDocument(this.swaggerKey)
            .subscribe((swaggerDoc: any) => {
                this.swaggerDocument = swaggerDoc;
                this.assignDocumentToEditor(swaggerDoc);
                this._busyState.clearBusyState();
            }, () => {
                this._busyState.clearBusyState();
            });
    }

    public renewSwaggerSecret() {
        this._busyState.setBusyState();
        this.createSwaggerSecret()
            .mergeMap(key => {
                this.swaggerKey = key;
                this.swaggerURL = this.getUpdatedSwaggerURL(key);
                return this.addorUpdateApiDefinitionURL(this.swaggerURL);
            })
            .catch(() => {
                return Observable.of(false);
            }).subscribe(() => {
                this._busyState.clearBusyState();
            });
    }

    private addorUpdateApiDefinitionURL(url: string) {
        return this._cacheService.getArm(`${this.functionApp.site.id}/config/web`, true)
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
                    return this._cacheService.putArm(`${this.functionApp.site.id}/config/web`, null, JSON.stringify(config)).map(r => r.json());
                }

                return Observable.of(true);
            });
    }

    private getSwaggerSecret() {
        return this.functionApp.getSystemKey()
            .map(keys => {
                let swaggerKey: string = null;
                keys.keys.forEach(key => {
                    if (key.name === Constants.swaggerSecretName) {
                        swaggerKey = key.value;
                    }
                });
                return swaggerKey;
            });
    }

    private getUpdatedSwaggerURL(key: string) {
        return this.functionApp.getMainSiteUrl() + '/admin/host/swagger?code=' + key;
    }

    private createSwaggerSecret() {
        return this.functionApp.createSystemKey(Constants.swaggerSecretName)
            .map(key => { return key.value; });
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
        return this.functionApp.getSwaggerDocument(key)
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
