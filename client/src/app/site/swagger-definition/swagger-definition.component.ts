import { ScenarioService } from './../../shared/services/scenario/scenario.service';
import { KeyCodes, Constants, ScenarioIds, SiteTabIds, ARMApiVersions } from './../../shared/models/constants';
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
import { HttpResult } from '../../shared/models/http-result';
import { Host } from '../../shared/models/host';
import { FunctionAppEditMode } from 'app/shared/models/function-app-edit-mode';
import { EditModeHelper } from 'app/shared/Utilities/edit-mode.helper';
import { FunctionService } from 'app/shared/services/function.service';

@Component({
  selector: 'swaggerdefinition',
  templateUrl: './swagger-definition.component.html',
  styleUrls: ['./swagger-definition.component.scss'],
})
export class SwaggerDefinitionComponent extends FunctionAppContextComponent implements OnDestroy {
  @ViewChild(BusyStateComponent)
  busyState: BusyStateComponent;
  public isFullscreen: boolean;
  public keyVisible: boolean;
  public documentationVisible: boolean;
  public swaggerEnabled: boolean;
  public exportToPowerAppsAvailable = false;
  public exportToPowerAppsDisabled = true;
  public swaggerStatusOptions: SelectOption<boolean>[];
  public valueChange: Subject<boolean>;
  public swaggerKey: string;
  public swaggerURL: string;
  public generation: string;
  public isReadonlyFunctionApp = false;

  private swaggerEditor: SwaggerEditor;
  private swaggerDocument: any;

  private _ngUnsubscribe = new Subject();
  private _busyManager: BusyStateScopeManager;

  constructor(
    private _aiService: AiService,
    private _portalService: PortalService,
    private _cacheService: CacheService,
    broadcastService: BroadcastService,
    private _translateService: TranslateService,
    private _functionAppService: FunctionAppService,
    private _scenarioService: ScenarioService,
    functionService: FunctionService
  ) {
    super('swagger-definition', _functionAppService, broadcastService, functionService, () => this._busyManager.setBusy());

    this._busyManager = new BusyStateScopeManager(broadcastService, SiteTabIds.apiDefinition);
    this.swaggerStatusOptions = [
      {
        displayLabel: this._translateService.instant(PortalResources.swaggerDefinition_internal),
        value: true,
      },
      {
        displayLabel: this._translateService.instant(PortalResources.swaggerDefinition_external),
        value: false,
      },
    ];

    this.valueChange = new Subject<boolean>();
    this.valueChange.subscribe((swaggerEnabled: boolean) => {
      this._busyManager.setBusy();
      if (this.swaggerEnabled === swaggerEnabled) {
        this._busyManager.clearBusy();
      } else {
        this.swaggerEnabled = swaggerEnabled;
        this.setSwaggerEndpointState(swaggerEnabled).subscribe(() => {
          this.clearBusyState();
        });
      }
    });
  }

  setup(): Subscription {
    return this.viewInfoEvents
      .switchMap(viewInfo => {
        return Observable.zip(
          this._functionAppService.getHostV1Json(this.context),
          this._functionAppService.getRuntimeGeneration(this.context),
          this._functionAppService.getFunctionAppEditMode(this.context),
          (a: HttpResult<Host>, b: string, c: HttpResult<FunctionAppEditMode>) => ({
            host: a,
            gen: b,
            appEditModeResult: c,
          })
        );
      })
      .switchMap(result => {
        this.generation = result.gen;
        this.swaggerEnabled = false;
        this.isReadonlyFunctionApp = result.appEditModeResult.isSuccessful && EditModeHelper.isReadOnly(result.appEditModeResult.result);

        if (!this.isReadonlyFunctionApp) {
          if (
            result.host &&
            result.host.isSuccessful &&
            result.host.result.swagger &&
            typeof result.host.result.swagger.enabled === 'boolean'
          ) {
            this.swaggerEnabled = result.host.result.swagger.enabled;
          }

          this.exportToPowerAppsAvailable = this._scenarioService.checkScenario(ScenarioIds.enableExportToPowerApps).status !== 'disabled';
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
    this._portalService.openBladeDeprecated(
      {
        detailBlade: name,
        detailBladeInputs: { resourceUri: this.context.site.id },
      },
      name
    );
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
    return this._functionAppService
      .getHostV1Json(this.context)
      .concatMap(jsonObj => {
        if (jsonObj.isSuccessful) {
          jsonObj.result.swagger = { enabled: swaggerEnabled };
          const jsonString = JSON.stringify(jsonObj.result);
          return this._functionAppService.saveHostJson(this.context, jsonString);
        } else {
          return Observable.of({
            isSuccessful: false,
            error: {
              errorId: '',
            },
            result: null,
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
      })
      .do(null, () => {
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
      })
      .do(null, () => {
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
      if (
        ((!swaggerDocument || swaggerDocument === this._translateService.instant(PortalResources.swaggerDefinition_placeHolder)) &&
          !error) ||
        confirm(this._translateService.instant(PortalResources.swaggerDefinition_confirmOverwrite))
      ) {
        this._functionAppService.getGeneratedSwaggerData(this.context, this.swaggerKey).subscribe(swaggerDoc => {
          this.swaggerDocument = swaggerDoc.result;
          this.assignDocumentToEditor(swaggerDoc.result);
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
          resourceId: this.context.site.id,
        });

        this._busyManager.clearBusy();
        return;
      }

      if (swaggerDocument) {
        this._cacheService.clearCachePrefix(this.swaggerURL);
        this._functionAppService.addOrUpdateSwaggerDocument(this.context, this.swaggerURL, swaggerDocument).subscribe(
          updatedDocument => {
            this.swaggerDocument = updatedDocument.result;
            this._busyManager.clearBusy();
            this.exportToPowerAppsDisabled = false;
          },
          () => {
            this._busyManager.clearBusy();
          }
        );
        return;
      }

      if (!swaggerDocument && !error) {
        const confirmDelete = confirm(this._translateService.instant(PortalResources.swaggerDefinition_delete));
        if (confirmDelete) {
          this._functionAppService.deleteSwaggerDocument(this.context, this.swaggerURL).subscribe(
            () => {
              this.swaggerDocument = this._translateService.instant(PortalResources.swaggerDefinition_placeHolder);
              this._busyManager.clearBusy();
            },
            () => {
              this._busyManager.clearBusy();
            }
          );
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
    this._functionAppService.getSwaggerDocument(this.context, this.swaggerKey).subscribe(
      swaggerDoc => {
        this.swaggerDocument = swaggerDoc.result;
        this.assignDocumentToEditor(swaggerDoc.result);
        this._busyManager.clearBusy();
      },
      () => {
        this._busyManager.clearBusy();
      }
    );
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
      })
      .subscribe(() => {
        this._busyManager.clearBusy();
      });
  }

  private addorUpdateApiDefinitionURL(url: string) {
    return this._cacheService
      .getArm(`${this.context.site.id}/config/web`, true, ARMApiVersions.antaresApiVersion20181101)
      .map(r => r.json())
      .mergeMap(config => {
        let configChange = false;

        if (!config.properties.apiDefinition || !config.properties.apiDefinition.url || config.properties.apiDefinition.url !== url) {
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
          if (config.properties && config.properties.azureStorageAccounts) {
            delete config.properties.azureStorageAccounts;
          }

          return this._cacheService
            .putArm(`${this.context.site.id}/config/web`, ARMApiVersions.antaresApiVersion20181101, JSON.stringify(config))
            .map(r => r.json());
        }

        return Observable.of(true);
      });
  }

  private getSwaggerSecret() {
    return this._functionAppService.getSystemKey(this.context).map(keys => {
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
    return this._functionAppService.createSystemKey(this.context, Constants.swaggerSecretName).map(key => {
      return key.result.value;
    });
  }

  private restoreSwaggerSecrets() {
    return this.getSwaggerSecret()
      .mergeMap(key => {
        if (!key) {
          return this.createSwaggerSecret();
        }
        return Observable.of(key);
      })
      .catch(() => {
        // get or create key fails
        this.swaggerEnabled = false;
        return Observable.of('');
      })
      .mergeMap(key => {
        if (key) {
          this.swaggerKey = key;
        }
        return Observable.of(key);
      });
  }

  private loadLatestSwaggerDocumentInEditor(key: string) {
    this.swaggerURL = this.getUpdatedSwaggerURL(key);
    return this._functionAppService
      .getSwaggerDocument(this.context, key)
      .retry(1)
      .mergeMap(swaggerDoc => {
        const document = swaggerDoc.isSuccessful
          ? swaggerDoc.result
          : this._translateService.instant(PortalResources.swaggerDefinition_placeHolder);

        this.exportToPowerAppsDisabled = !swaggerDoc.isSuccessful;

        this.swaggerDocument = document;
        this.assignDocumentToEditor(document);
        if (this.swaggerKey) {
          return this.addorUpdateApiDefinitionURL(this.swaggerURL);
        }
        return Observable.of(true);
      })
      .catch(() => {
        return Observable.of(false);
      });
  }
}
