import { Component, OnDestroy, Input, Output, ViewChild, OnChanges, ElementRef, AfterViewChecked } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { FunctionInfo } from '../shared/models/function-info';
import { UserService } from '../shared/services/user.service';
import { BroadcastService } from '../shared/services/broadcast.service';
import { HostEventClient } from '../shared/host-event-client';
import { MonacoEditorDirective } from '../shared/directives/monaco-editor.directive';
import { BusyStateComponent } from '../busy-state/busy-state.component';
import { FunctionAppContextComponent } from '../shared/components/function-app-context-component';
import { FunctionAppService } from '../shared/services/function-app.service';
import { Subject } from 'rxjs/Subject';
import { VfsObject } from '../shared/models/vfs-object';
import { FunctionService } from 'app/shared/services/function.service';

@Component({
  selector: 'errors-warnings',
  templateUrl: './errors-warnings.component.html',
  styleUrls: ['./errors-warnings.component.scss', '../function-dev/function-dev.component.scss'],
})
export class ErrorsWarningsComponent extends FunctionAppContextComponent implements AfterViewChecked, OnChanges, OnDestroy {
  public codeColumnWidth = 75;
  public msgColumnWidth: number;
  public sourceColumnWidth = 125;
  public startLineNumberColumnWidth = 50;
  public startColumnColumnWidth = 75;
  @Input()
  monacoEditor: MonacoEditorDirective;
  @Output()
  selectFile = new Subject<[VfsObject, monaco.editor.IMarkerData[], monaco.editor.IMarkerData]>();
  @ViewChild(BusyStateComponent)
  busyState: BusyStateComponent;
  @ViewChild('diagnosticsTable')
  tableElement: ElementRef;

  public diagnostics: monaco.editor.IMarkerData[];

  private functionInfo: FunctionInfo;
  private hostEventClient: HostEventClient;
  private monacoSubscription: Subscription;
  constructor(
    functionAppService: FunctionAppService,
    broadcastService: BroadcastService,
    private userService: UserService,
    functionService: FunctionService
  ) {
    super('errors-warnings', functionAppService, broadcastService, functionService, () => this.setBusyState(), () => this.clearBusyState());
    this.selectFile = new Subject();
  }

  setup(): Subscription {
    return (
      this.viewInfoEvents
        .do(v => {
          if (!this.hostEventClient || v.context.site.id !== this.hostEventClient.id) {
            // If we don't have a client or the client we have was for a different function app
            // create a new one
            if (this.hostEventClient) {
              // make sure to dispose of the old client to kill any long standing streaming requests.
              this.hostEventClient.dispose();
            }
            this.hostEventClient = new HostEventClient(v.context, this.userService);
          }
          this.functionInfo = v.functionInfo.result.properties;
          this.clearBusyState();
        })
        // Every time the function changes, we want to unsubscribe to the old one
        // and re-subscribe to the new event stream; hence the switchMap.
        // If the client changed, it should auto unsubscribe since we close
        // the client event subject on dispose.
        .switchMap(v => this.hostEventClient.getEvents(v.functionDescriptor.name))
        .subscribe(event => {
          this.diagnostics = event.diagnostics;
          if (this.monacoEditor) {
            this.monacoEditor.setDiagnostics(this.diagnostics);
          }
        })
    );
  }

  ngAfterViewChecked() {
    // Call resize after any changes in the view.
    this.onResize();
  }

  ngOnChanges(): void {
    if (this.monacoSubscription) {
      this.monacoSubscription.unsubscribe();
      delete this.monacoSubscription;
    }
    if (this.monacoEditor) {
      // make sure to refresh monaco with the diagnostics information
      // whenever there is a change in the editor
      this.monacoSubscription = this.monacoEditor.onSave
        .merge(this.monacoEditor.onContentChanged)
        .merge(this.monacoEditor.onFileChanged)
        .debounceTime(50)
        .subscribe(() => {
          this.monacoEditor.setDiagnostics(this.diagnostics);
        });
    }
  }

  ngOnDestroy() {
    if (this.hostEventClient) {
      this.hostEventClient.dispose();
      delete this.hostEventClient;
    }
    if (this.selectFile) {
      this.selectFile.complete();
      delete this.selectFile;
    }
    super.ngOnDestroy();
  }

  onResize() {
    // TODO: ideally we would get rid of this method and have the table
    // self-resize using css rules. I haven't done any major changes to the
    // template of this component from the original PR just to limit the scope
    const severityColumnWidth = 50;
    const sumOtherColumns =
      severityColumnWidth + this.codeColumnWidth + this.sourceColumnWidth + this.startLineNumberColumnWidth + this.startColumnColumnWidth;
    this.msgColumnWidth = this.tableElement.nativeElement.clientWidth - sumOtherColumns;
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

  public itemClick(diagnostic: monaco.editor.IMarkerData) {
    // when an item is clicked, we fire an Output event with
    // A VfsObject for the file: this allows the listener to open the file if not opened
    // List of diagnostics info: this allows the listener to set the diag info if the file changed
    // The current diagnostic that was clicked: this allows the listener to setPosition of the editor
    if (diagnostic.source) {
      this.selectFile.next([
        {
          name: diagnostic.source,
          href: `${this.functionInfo.script_root_path_href}${diagnostic.source}`,
          mime: 'plain/text',
        },
        this.diagnostics,
        diagnostic,
      ]);
    }
  }

  public getSeverityClass(severity: monaco.Severity) {
    let result: string;
    switch (severity) {
      case monaco.Severity.Error:
        result = 'fa-times-circle severityerror';
        break;
      case monaco.Severity.Warning:
        result = 'fa-exclamation-triangle severitywarning';
        break;
      case monaco.Severity.Info:
        result = 'fa-info-circle severityinfo';
        break;
    }

    return 'fa severitycolumn ' + result;
  }
}
