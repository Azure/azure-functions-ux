import { Component, Input, OnInit, EventEmitter, NgZone, OnDestroy } from '@angular/core';
import { Response } from '@angular/http';
import { DropDownElement } from '../../shared/models/drop-down-element';
import { SwaggerEditor } from '../swagger-frame/swaggerEditor';
import { AiService } from '../../shared/services/ai.service';
import { GlobalStateService } from '../../shared/services/global-state.service';
import { ArmService } from '../../shared/services/arm.service';
import { SelectOption } from '../../shared/models/select-option';
import { PortalService } from '../../shared/services/portal.service';
import { Subject, Observable, Subscription as RxSubscription } from 'rxjs/Rx';
import { FunctionKey, FunctionKeys } from '../../shared/models/function-key';
import { Constants } from '../../shared/models/constants';
import { TranslateService, TranslatePipe } from 'ng2-translate/ng2-translate';
import { PortalResources } from '../../shared/models/portal-resources';
import { BroadcastService } from '../../shared/services/broadcast.service';
import { BroadcastEvent } from '../../shared/models/broadcast-event';
import { ErrorIds } from '../../shared/models/error-ids';
import { ErrorEvent, ErrorType } from '../../shared/models/error-event';
import { FunctionApp } from '../../shared/function-app';
import { CacheService } from '../../shared/services/cache.service';
import { TreeViewInfo } from './../../tree-view/models/tree-view-info';
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
    public isFullscreen: boolean;
    public keyVisible: boolean;
    public documentationVisible: boolean;
    public swaggerEnabled: boolean;

    public site: ArmObj<Site>;
    public functionApp: FunctionApp;

    private swaggerEditor: SwaggerEditor;
    private swaggerDocument: any;
    public swaggerStatusOptions: SelectOption<boolean>[];
    private valueChange: Subject<boolean>;

    private swaggerKey: string;
    private swaggerURL: string;

    private _viewInfoStream = new Subject<TreeViewInfo>();
    private _viewInfoSub: RxSubscription;
    private _viewInfo: TreeViewInfo;
    private _appNode: AppNode;

    constructor(private _aiService: AiService,
        private _portalService: PortalService,
        private _globalStateService: GlobalStateService,
        private _cacheService: CacheService,
        private _broadcastService: BroadcastService,
        private _translateService: TranslateService,
    ) {
        this._viewInfoSub = this._viewInfoStream
            .switchMap(viewInfo => {
                this._viewInfo = viewInfo;
                this._globalStateService.setBusyState();

                this._appNode = (<AppNode>viewInfo.node);

                return Observable.zip(
                    this._cacheService.getArm(viewInfo.resourceId),
                    this._appNode.functionAppStream,
                    (s: Response, fa: FunctionApp) => ({ siteResponse: s, functionApp: fa }))
            })
            .switchMap(r => {
                this.functionApp = r.functionApp;
                this.site = r.siteResponse.json();
                return this.functionApp.getHostJson();
            })
            .do(null, e => {
                this._aiService.trackException(e, "swagger-definition");
                this.swaggerEnabled = false;
                this._globalStateService.clearBusyState();
            })
            .retry()
            .flatMap(jsonObj => {
                this.swaggerEnabled = false;
                if (jsonObj && jsonObj.swagger && typeof (jsonObj.swagger.enabled) === "boolean") {
                    this.swaggerEnabled = jsonObj.swagger.enabled;
                }

                if (this.swaggerEnabled) {
                    return this.restoreSwaggerArtifacts();
                } else {
                    this.swaggerEnabled = false;
                    return Observable.of(this.swaggerEnabled);
                }
            }).do(null, e => {
                this.swaggerEnabled = false;
                return Observable.of(this.swaggerEnabled);
            })
            .subscribe(swaggerEnabled => {
                this._globalStateService.clearBusyState();
                let traceKey = this._viewInfo.data.siteTraceKey;
                this._aiService.stopTrace("/site/function-definition-tab-ready", traceKey);
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
                this._globalStateService.setBusyState();
                if (this.swaggerEnabled == swaggerEnabled) {
                    this._globalStateService.clearBusyState();
                } else {
                    this.swaggerEnabled = swaggerEnabled;
                    this.setSwaggerEndpointState(swaggerEnabled)
                        .subscribe((result) => {
                            this._globalStateService.clearBusyState();
                        })
                }
            });
    }

    set viewInfoInput(viewInfo: TreeViewInfo) {
        this._viewInfoStream.next(viewInfo);
    }

    ngOnDestroy() {
        if (this._viewInfoSub) {
            this._viewInfoSub.unsubscribe();
            this._viewInfoSub = null;
        }
    }

    openBlade(name: string) {
        this._portalService.openBlade({
            detailBlade: name,
            detailBladeInputs: { resourceUri: this.functionApp.site.id }
        }, name);
    }

    private setSwaggerEndpointState(swaggerEnabled: boolean) {
        return this.functionApp.getHostJson()
            .flatMap(jsonObj => {
                jsonObj.swagger = { enabled: swaggerEnabled };
                var jsonString = JSON.stringify(jsonObj);
                return this.functionApp.saveHostJson(jsonString);
            }).catch(error => {
                this._globalStateService.clearBusyState();
                return Observable.of(null);
            }).flatMap(config => {
                if (config == null) {
                    this.swaggerEnabled = !swaggerEnabled;
                    return Observable.of(false);
                }
                this.swaggerEnabled = config.swagger.enabled;
                if (!this.swaggerEnabled) {
                    this._aiService.trackEvent(`/actions/swagger_definition/disable_swagger_endpoint`);
                    return Observable.of(true);
                } else {
                    this._aiService.trackEvent(`/actions/swagger_definition/enable_swagger_endpoint`);
                    return this.restoreSwaggerArtifacts();
                }
            })
    }

    public onSwaggerEditorReady(swaggerEditor: SwaggerEditor): void {
        this.swaggerEditor = swaggerEditor;
        if (!this.swaggerEditor) {
            return;
        }

        if (!this.swaggerDocument) {
            this.swaggerDocument = {};
        }

        this.swaggerEditor.setDocument(this.swaggerDocument);
    }

    private assignDocumentToEditor(swaggerDocument) {
        if (this.swaggerEditor) {
            this.swaggerEditor.setDocument(swaggerDocument);
        }
    }
    public LoadGeneratedDataInEditor() {
        this.functionApp.getGeneratedSwaggerData(this.swaggerKey)
            .subscribe((swaggerDoc: any) => {
                this.swaggerDocument = swaggerDoc;
                this.assignDocumentToEditor(swaggerDoc);
            });
    }

    public toggleKeyVisibility(): void {
        this.keyVisible = !this.keyVisible;
    }

    public toggleDocumentationVisibility(): void {
        this.documentationVisible = !this.documentationVisible;
    }

    public saveChanges(): void {
        this._globalStateService.setBusyState();
        this.swaggerEditor.getDocument((swaggerDocument, error) => {
            if (error) {
                this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                    message: this._translateService.instant(PortalResources.swaggerDefinition_prompt),
                    errorId: ErrorIds.malformedAPIDefinition,
                    errorType: ErrorType.UserError
                });
                this._globalStateService.clearBusyState();
                return;
            }

            if (swaggerDocument) {
                this.functionApp.addOrUpdateSwaggerDocument(this.swaggerURL, swaggerDocument).
                    subscribe(updatedDocument => {
                        this.swaggerDocument = updatedDocument;
                        this._globalStateService.clearBusyState();
                    }, e => {
                        this._globalStateService.clearBusyState();
                    });
                return;
            }

            if (!swaggerDocument && !error) {
                var confirmDelete = confirm(this._translateService.instant(PortalResources.swaggerDefinition_delete));
                if (confirmDelete) {
                    this.functionApp.deleteSwaggerDocument(this.swaggerURL).
                        subscribe(() => {
                            this._globalStateService.clearBusyState();
                        }, e => {
                            this._globalStateService.clearBusyState();
                        });
                } else {
                    this.assignDocumentToEditor(this.swaggerDocument);
                    this._globalStateService.clearBusyState();
                }
                return;
            }
        });
    }

    public resetEditor(): void {
        this._globalStateService.setBusyState();
        this.functionApp.getSwaggerDocument(this.swaggerKey)
            .subscribe((swaggerDoc: any) => {
                this.swaggerDocument = swaggerDoc;
                this.assignDocumentToEditor(swaggerDoc);
                this._globalStateService.clearBusyState();
            }, e => {
                this._globalStateService.clearBusyState();
            });
    }

    public renewSwaggerSecret() {
        this._globalStateService.setBusyState()
        this.createSwaggerSecret()
            .flatMap(key => {
                this.swaggerKey = key;
                this.swaggerURL = this.getUpdatedSwaggerURL(key);
                return this.addorUpdateApiDefinitionURL(this.swaggerURL);
            })
            .catch(error => {
                return Observable.of(false);
            }).subscribe(result => {
                this._globalStateService.clearBusyState();
            });
    }

    private addorUpdateApiDefinitionURL(url: string) {
        return this._cacheService.getArm(`${this.functionApp.site.id}/config/web`, true)
            .map(r => r.json())
            .flatMap(config => {
                let configChange: boolean = false;

                if (!config.properties.apiDefinition ||
                    !config.properties.apiDefinition.url ||
                    config.properties.apiDefinition.url != url) {
                    config.properties.apiDefinition = { url: url };
                    configChange = true;
                }

                if (!config.properties.cors.allowedOrigins.includes(Constants.portalHostName)) {
                    config.properties.cors.allowedOrigins.push(Constants.portalHostName)
                    configChange = true;
                }

                if (!config.properties.cors.allowedOrigins.includes(Constants.webAppsHostName)) {
                    config.properties.cors.allowedOrigins.push(Constants.webAppsHostName)
                    configChange = true;
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
                    if (key.name == Constants.swaggerSecretName) {
                        swaggerKey = key.value;
                    }
                });
                return swaggerKey;
            })
    }

    private getUpdatedSwaggerURL(key: string) {
        return this.functionApp.getMainSiteUrl() + "/admin/host/swagger?code=" + key;
    }

    private createSwaggerSecret() {
        return this.functionApp.createSystemKey(Constants.swaggerSecretName)
            .map(key => { return key.value; });
    }

    private restoreSwaggerArtifacts() {
        return this.getSwaggerSecret()
            .flatMap(key => {
                if (!key) {
                    return this.createSwaggerSecret();
                }
                return Observable.of(key);
            }).catch(error => {
                // get or create key fails
                this.swaggerEnabled = false;
                return Observable.of("");
            }).flatMap(key => {
                if (!key) {
                    // will be passed to swagger doc
                    return Observable.of({});
                }
                this.swaggerKey = key;
                this.swaggerURL = this.getUpdatedSwaggerURL(key);
                return this.functionApp.getSwaggerDocument(key);
            })
            .retry(1)
            .catch(error => {
                // get document fails                
                return Observable.of({});
            }).flatMap(swaggerDoc => {
                this.swaggerDocument = swaggerDoc;
                this.assignDocumentToEditor(swaggerDoc);
                if (this.swaggerKey) {
                    return this.addorUpdateApiDefinitionURL(this.swaggerURL);
                }
                return Observable.of(true);
            }).catch(error => {
                return Observable.of(false);
            });
    }
}