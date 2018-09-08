import { SiteTabIds } from 'app/shared/models/constants';
import { EmbeddedService } from './../../../shared/services/embedded.service';
import { CdsFunctionDescriptor } from 'app/shared/resourceDescriptors';
import { PortalResources } from 'app/shared/models/portal-resources';
import { TranslateService } from '@ngx-translate/core';
import { ErrorEvent } from 'app/shared/models/error-event';
import { errorIds } from 'app/shared/models/error-ids';
import { Observable } from 'rxjs/Observable';
import { HttpResult } from './../../../shared/models/http-result';
import { FunctionEditorEvent } from './../function-editor-event';
import { TextEditorComponent } from 'app/controls/text-editor/text-editor.component';
import { CacheService } from './../../../shared/services/cache.service';
import { BusyStateScopeManager } from './../../../busy-state/busy-state-scope-manager';
import { FunctionInfo } from 'app/shared/models/function-info';
import { TabComponent } from './../../../controls/tabs/tab/tab.component';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { Subject } from 'rxjs/Subject';
import { Component, ViewChild, Output, Input, OnChanges, SimpleChange, ContentChildren, QueryList, OnDestroy } from '@angular/core';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { FunctionSchemaEvent } from './../function-schema-event';

@Component({
  selector: 'embedded-function-test-tab',
  templateUrl: './embedded-function-test-tab.component.html',
  styleUrls: ['./embedded-function-test-tab.component.scss']
})
export class EmbeddedFunctionTestTabComponent implements OnChanges, OnDestroy {
  @Input() resourceId: string;
  @Input() firstRun: boolean;
  @Output() onExpanded = new Subject<boolean>();
  @ViewChild(TextEditorComponent) textEditor: TextEditorComponent;

  @ContentChildren(TabComponent) tabs: QueryList<TabComponent>;

  public expanded = false;

  public responseOutputText = '';
  public initialEditorContent = '';

  private _updatedEditorContent = '';
  private _resourceIdStream = new Subject<string>();
  private _functionInfo: FunctionInfo;
  private _busyManager: BusyStateScopeManager;
  private _ngUnsubscribe = new Subject();

  private _requestSchemaPath: string;
  private _responseSchemaPath: string;

  constructor(
    private _cacheService: CacheService,
    private _broadcastService: BroadcastService,
    private _translateService: TranslateService,
    private _embeddedService: EmbeddedService) {

    this._busyManager = new BusyStateScopeManager(this._broadcastService, SiteTabIds.embeddedTest);

    this._resourceIdStream
      .takeUntil(this._ngUnsubscribe)
      .distinctUntilChanged()
      .switchMap(resourceId => {
        this._busyManager.setBusy();
        return this._getFunction(resourceId);
      })
      .retry()
      .subscribe(r => {
        this._busyManager.clearBusy();

        if (!r.isSuccessful) {
          this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
            message: r.error.message,
            errorId: r.error.errorId,
            resourceId: this.resourceId,
          });

          return;
        }

        this._functionInfo = r.result;
        this._requestSchemaPath = this._getRequestUrl(this.resourceId);
        this._responseSchemaPath = this._getResponseUrl(this.resourceId);

        try {
          const content = JSON.parse(this._functionInfo.test_data);
          this.initialEditorContent = content.body ? JSON.stringify(content.body, null, '    ') : '';
        } catch (e) {
          this.initialEditorContent = '';
        }

        this._updatedEditorContent = this.initialEditorContent;

        if (this.firstRun) {
          this.runTest();
        }
      });

    this._broadcastService.getEvents<FunctionEditorEvent<void>>(BroadcastEvent.FunctionEditorEvent)
      .takeUntil(this._ngUnsubscribe)
      .subscribe(r => {
        switch (r.type) {
          case 'runTest':
            this.runTest();
            break;
          default:
            break;
        }
      });

      this._broadcastService.getEvents<FunctionSchemaEvent<void>>(BroadcastEvent.FunctionSchemaEvent)
      .takeUntil(this._ngUnsubscribe)
      .subscribe(r => {
        switch (r.type) {
          case 'saveSchema':
            this.saveSchema();
            break;
          default:
            break;
        }
      });
  }

  private _getFunction(resourceId: string) {
    return this._cacheService.getArm(resourceId, true)
      .map(r => {
        return <HttpResult<FunctionInfo>>{
          isSuccessful: true,
          error: null,
          result: r.json()
        };
      })
      .catch(e => {
        const descriptor = new CdsFunctionDescriptor(resourceId);
        return Observable.of(<HttpResult<FunctionInfo>>{
          isSuccessful: false,
          error: {
            errorId: errorIds.embeddedEditorLoadError,
            message: this._translateService.instant(PortalResources.error_unableToRetrieveFunction).format(descriptor.name)
          }
        });
      });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
  }

  ngOnChanges(changes: { [key: string]: SimpleChange }) {
    if (changes['resourceId']) {
      this._resourceIdStream.next(this.resourceId);
    }
  }

  runTest() {
    this._busyManager.setBusy();

    this._embeddedService.runFunction(this._functionInfo.trigger_url, this._updatedEditorContent)
      .subscribe(r => {
        this._busyManager.clearBusy();
        this.responseOutputText = r.text();
      }, err => {
        this._busyManager.clearBusy();

        try {
          this.responseOutputText = `Failed to execute - ${err.text()}`;
        } catch (e) {
          this.responseOutputText = 'Failed to execute';
        }
      });
  }

  editorContentChanged(content: string) {
    this._updatedEditorContent = content;
  }

  saveSchema() {
    //TODO: Run these in parallel
    this._saveRequestSchemaContent();
    this._saveResponseSchemaContent();
  }

  _saveRequestSchemaContent() {
    this._busyManager.setBusy();
    this._cacheService.putArm(this._requestSchemaPath, null, JSON.stringify(this._updatedEditorContent))
      .subscribe(r => {
        this._busyManager.clearBusy();
      }, err => {
        this._busyManager.clearBusy();
        this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
          message: this._translateService.instant(PortalResources.error_unableToUpdateSampleRequestSchema).format(this._functionInfo.name),
          errorId: errorIds.embeddedUpdateSampleRequestError,
          resourceId: this.resourceId,
        });
      });
  }

  _saveResponseSchemaContent() {
    this._busyManager.setBusy();
    this._cacheService.putArm(this._responseSchemaPath, null, JSON.stringify(this.responseOutputText))
      .subscribe(r => {
        this._busyManager.clearBusy();
      }, err => {
        this._busyManager.clearBusy();
        this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
          message: this._translateService.instant(PortalResources.error_unableToUpdateSampleResponseSchema).format(this._functionInfo.name),
          errorId: errorIds.embeddedUpdateSampleResponseError,
          resourceId: this.resourceId,
        });
      });
  }

  _getRequestUrl(resourceId: string): string
  {
    return `${resourceId}/files/sampleRequest.json`;
  }

  _getResponseUrl(resourceId: string): string
  {
    return `${resourceId}/files/sampleResponse.json`;
  }
}
