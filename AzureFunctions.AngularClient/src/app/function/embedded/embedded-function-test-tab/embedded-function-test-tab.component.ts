import { BottomTabEvent } from './../../../controls/bottom-tabs/bottom-tab-event';
import { FunctionEditorEvent } from './../function-editor-event';
import { RightTabEvent } from './../../../controls/right-tabs/right-tab-event';
import { TextEditorComponent } from 'app/controls/text-editor/text-editor.component';
import { CacheService } from './../../../shared/services/cache.service';
import { BusyStateScopeManager } from './../../../busy-state/busy-state-scope-manager';
import { FunctionInfo } from 'app/shared/models/function-info';
import { TabComponent } from './../../../controls/tabs/tab/tab.component';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { Subject } from 'rxjs/Subject';
import { FunctionApp } from 'app/shared/function-app';
import { Component, OnInit, ViewChild, Output, Input, OnChanges, SimpleChange, ContentChildren, QueryList, OnDestroy } from '@angular/core';
import { Headers } from '@angular/http';
import { BroadcastService } from 'app/shared/services/broadcast.service';

@Component({
  selector: 'embedded-function-test-tab',
  templateUrl: './embedded-function-test-tab.component.html',
  styleUrls: ['./embedded-function-test-tab.component.scss']
})
export class EmbeddedFunctionTestTabComponent implements OnInit, OnChanges, OnDestroy {
  @Input() resourceId: string;
  @Output() onExpanded = new Subject<boolean>();
  @ViewChild(TextEditorComponent) textEditor: TextEditorComponent;

  // @ViewChild('requestEditorContainer') requestEditorContainer: ElementRef;
  // @ViewChild(MonacoEditorDirective) requestEditor: MonacoEditorDirective;
  @ContentChildren(TabComponent) tabs: QueryList<TabComponent>;

  public functionApp: FunctionApp = null;
  public expanded = false;

  public responseOutputText = '';
  public initialEditorContent = '';

  private _updatedEditorContent = '';
  private _resourceIdStream = new Subject<string>();
  private _functionInfo: FunctionInfo;
  private _busyManager: BusyStateScopeManager;
  private _ngUnsubscribe = new Subject();

  constructor(private _cacheService: CacheService, private _broadcastService: BroadcastService) {

    this._busyManager = new BusyStateScopeManager(this._broadcastService, 'dashboard');

    this._resourceIdStream
      .takeUntil(this._ngUnsubscribe)
      .distinctUntilChanged()
      .switchMap(resourceId => {
        this._busyManager.setBusy();
        return this._cacheService.getArm(resourceId, true);
      })
      .do(null, err => {
        // TODO: ellhamai - handle error
        this._busyManager.clearBusy();
      })
      .retry()
      .subscribe(r => {
        this._busyManager.clearBusy();
        this._functionInfo = r.json();

        try {
          const content = JSON.parse(this._functionInfo.test_data);
          this.initialEditorContent = content.body ? JSON.stringify(content.body, null, '    ') : '';
        } catch (e) {
          this.initialEditorContent = '';
        }

        this._updatedEditorContent = this.initialEditorContent;
      });

    this._broadcastService.getEvents<RightTabEvent<boolean>>(BroadcastEvent.RightTabsEvent)
      .filter(e => e.type === 'isExpanded')
      .takeUntil(this._ngUnsubscribe)
      .subscribe(e => {
        this._resizeEditor();
      });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
  }

  private _resizeEditor() {
    this.textEditor.resize();
  }

  ngOnChanges(changes: { [key: string]: SimpleChange }) {
    if (changes['resourceId']) {
      this._resourceIdStream.next(this.resourceId);
    }
  }

  runTest() {
    this._broadcastService.broadcastEvent<BottomTabEvent<boolean>>(BroadcastEvent.BottomTabsEvent, {
      type: 'isExpanded',
      value: true
    });

    setTimeout(() => {
      this._broadcastService.broadcastEvent<FunctionEditorEvent<void>>(BroadcastEvent.FunctionEditorEvent, {
        type: 'runTest',
        value: null
      });
    });

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    headers.append('Cache-Control', 'no-cache');
    headers.append('Ocp-Apim-Subscription-Key', `403ca4c30e9d45fba7306a7a4edb5f75`);
    headers.append('Ocp-Apim-Trace', 'true');

    this._busyManager.setBusy();
    this._cacheService.post(this._functionInfo.trigger_url, true, headers, this._updatedEditorContent)
      .subscribe(r => {
        this._busyManager.clearBusy();
        this.responseOutputText = r.text();
      }, err => {
        this._busyManager.clearBusy();
        // TODO: ellhamai - not sure if handling error properly
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
}
