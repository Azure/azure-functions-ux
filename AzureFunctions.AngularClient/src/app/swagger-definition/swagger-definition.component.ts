import { Component, Input, OnInit, Output, EventEmitter, NgZone } from '@angular/core';
import { DropDownElement } from '../shared/models/drop-down-element';
import { SwaggerEditor } from '../swagger-frame/swaggerEditor';
import { AiService } from '../shared/services/ai.service';
import { GlobalStateService } from '../shared/services/global-state.service';
import { ArmService } from '../shared/services/arm.service';
import { FunctionContainer } from '../shared/models/function-container';
import { FunctionsService } from '../shared/services/functions.service';
import { SelectOption } from '../shared/models/select-option';
import { PortalService } from '../shared/services/portal.service';
import { Subject, Observable } from 'rxjs/Rx';
import { FunctionKey, FunctionKeys } from '../shared/models/function-key';
import { Constants } from '../shared/models/constants';
import { TranslateService, TranslatePipe } from 'ng2-translate/ng2-translate';
import { PortalResources } from '../shared/models/portal-resources';
import { BroadcastService } from '../shared/services/broadcast.service';
import { BroadcastEvent } from '../shared/models/broadcast-event';
import { ErrorIds } from '../shared/models/error-ids';
import { ErrorEvent, ErrorType } from '../shared/models/error-event';

@Component({
    selector: 'swaggerdefinition',
    templateUrl: './swagger-definition.component.html',
    styleUrls: ['./swagger-definition.component.css'],
    inputs: ['functionContainer']
})
export class SwaggerDefinitionComponent implements OnInit {
    public isFullscreen: boolean;
    public keyVisible: boolean;
    public swaggerEnabled: boolean;
    private swaggerEditor: SwaggerEditor;
    private swaggerDocument: any;
    private _functionContainer: FunctionContainer;    
    public swaggerStatusOptions: SelectOption<boolean>[];
    private valueChange: Subject<boolean>;
    private functionStream: Subject<FunctionKey>;
    private swaggerKey: string;
    private swaggerURL: string;

    constructor(private _aiService: AiService,
        private _portalService: PortalService,
        private _globalStateService: GlobalStateService,
        private _armService: ArmService,
        private _functionsService: FunctionsService,
        private _broadcastService: BroadcastService,
        private _translateService: TranslateService,
    ) {
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

    openBlade(name: string) {
        this._portalService.openBlade(name, "app-settings");
        this._aiService.trackEvent(`/actions/app_settings/open_${name}_blade`);
    }

    private setSwaggerEndpointState(swaggerEnabled: boolean) {
        return this._functionsService.getHostJson()
            .flatMap(jsonObj => {
                jsonObj.swagger = { enabled: swaggerEnabled };
                var jsonString = JSON.stringify(jsonObj);
                return this._functionsService.saveHostJson(jsonString);
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

    set functionContainer(value: FunctionContainer) {
        this._functionContainer = value;
    }

    get functionContainer() {
        return this._functionContainer;
    }

    public LoadGeneratedDataInEditor() {
        this._functionsService.getGeneratedSwaggerData(this.swaggerKey)
            .subscribe((swaggerDoc: any) => {
                this.swaggerDocument = swaggerDoc;
                this.assignDocumentToEditor(swaggerDoc);
            });
    }

    public toggleKeyVisibility(): void {
        this.keyVisible = !this.keyVisible;
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
                this._functionsService.addOrUpdateSwaggerDocument(this.swaggerURL, swaggerDocument).
                    subscribe(updatedDocument => {
                        this.swaggerDocument = updatedDocument;
                        this._globalStateService.clearBusyState();
                    }, e => {
                        this._globalStateService.clearBusyState();
                    });
                return;
            }

            if (!swaggerDocument &&
                !error &&
                confirm(this._translateService.instant(PortalResources.swaggerDefinition_delete))) {
                this._functionsService.deleteSwaggerDocument(this.swaggerURL).
                    subscribe(() => {
                        this._globalStateService.clearBusyState();
                    }, e => {
                        this._globalStateService.clearBusyState();
                    });
                return;
            }
        });
    }

    public resetEditor(): void {
        this._globalStateService.setBusyState();
        this._functionsService.getSwaggerDocument(this.swaggerKey)
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
        if (this._globalStateService.FunctionContainer && this._globalStateService.FunctionContainer.id) {
            return this._armService.getFullConfig(this._globalStateService.FunctionContainer)
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
                        return this._armService.setFullConfig(this._globalStateService.FunctionContainer, JSON.stringify(config));
                    }

                    return Observable.of(true);
                });
        }
    }

    private getSwaggerSecret() {
        return this._functionsService.getSystemKey()
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
        return this._functionsService.getMainSiteUrl() + "/admin/host/swagger?code=" + key;
    }

    private createSwaggerSecret() {
        return this._functionsService.createSystemKey(Constants.swaggerSecretName)
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
                return this._functionsService.getSwaggerDocument(key);
            }).catch(error => {
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

    ngOnInit() {
        this._globalStateService.setBusyState();
        this._functionsService.getHostJson()
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
            }).catch(error => {
                this.swaggerEnabled = false;
                return Observable.of(this.swaggerEnabled);
            }).subscribe(swaggerEnabled => {
                this._globalStateService.clearBusyState();
            });
    }
}