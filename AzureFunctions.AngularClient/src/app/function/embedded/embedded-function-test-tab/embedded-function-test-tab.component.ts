import { CacheService } from './../../../shared/services/cache.service';
import { BusyStateScopeManager } from './../../../busy-state/busy-state-scope-manager';
import { FunctionInfo } from 'app/shared/models/function-info';
import { TabComponent } from './../../../controls/tabs/tab/tab.component';
import { MonacoEditorDirective } from './../../../shared/directives/monaco-editor.directive';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { Subject } from 'rxjs/Subject';
import { FunctionApp } from 'app/shared/function-app';
import { Component, OnInit, ViewChild, ElementRef, AfterContentInit, Output, Input, OnChanges, SimpleChange, ContentChildren, QueryList } from '@angular/core';
import { Headers } from '@angular/http';
import { BroadcastService } from 'app/shared/services/broadcast.service';

@Component({
  selector: 'embedded-function-test-tab',
  templateUrl: './embedded-function-test-tab.component.html',
  styleUrls: ['./embedded-function-test-tab.component.scss']
})
export class EmbeddedFunctionTestTabComponent implements OnInit, AfterContentInit, OnChanges {
  @Input() resourceId: string;
  @Output() onExpanded = new Subject<boolean>();
  @ViewChild('requestEditorContainer') requestEditorContainer: ElementRef;
  @ViewChild(MonacoEditorDirective) requestEditor: MonacoEditorDirective;
  @ContentChildren(TabComponent) tabs: QueryList<TabComponent>;

  public functionApp: FunctionApp = null;
  public expanded = false;

  public responseOutputText = '';
  public initialEditorContent = '';

  private _updatedEditorContent = '';
  private _resourceIdStream = new Subject<string>();
  private _functionInfo: FunctionInfo;
  private _busyManager: BusyStateScopeManager;

  constructor(private _cacheService: CacheService, private _broadcastService: BroadcastService) {

    this._busyManager = new BusyStateScopeManager(this._broadcastService, 'dashboard');

    this._resourceIdStream
      .distinctUntilChanged()
      .switchMap(resourceId => {
        this._busyManager.setBusy();
        return this._cacheService.getArm(resourceId);
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
  }

  ngOnInit() {
  }

  // toggleExpanded() {
  //   this.expanded = !this.expanded;
  //   this.onExpanded.next(this.expanded);

  //   if (this.expanded) {
  //     this.onResize();
  //   }
  // }

  ngAfterContentInit() {
    this.onResize();
  }

  ngOnChanges(changes: { [key: string]: SimpleChange }) {
    if (changes['resourceId']) {
      this._resourceIdStream.next(this.resourceId);
    }
  }

  onResize() {
    setTimeout(() => {
      const width = this.requestEditorContainer.nativeElement.clientWidth;
      const height = this.requestEditorContainer.nativeElement.clientHeight;
      this.requestEditor.setLayout(width - 4, height - 4);
    }, 1000);
  }

  runTest() {
    this._broadcastService.broadcastEvent(BroadcastEvent.StartPollingFunctionLogs);

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
