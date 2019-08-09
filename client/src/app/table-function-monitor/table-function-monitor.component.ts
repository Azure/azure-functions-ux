import { FunctionAppService } from 'app/shared/services/function-app.service';
import { Component, Input, ViewChild, Injector } from '@angular/core';
import { FunctionMonitorService } from '../shared/services/function-monitor.service';
import { FunctionInvocations, FunctionMonitorInfo } from '../shared/models/function-monitor';
import { BusyStateComponent } from '../busy-state/busy-state.component';
import { KeyCodes, ComponentNames } from 'app/shared/models/constants';
import { FeatureComponent } from '../shared/components/feature-component';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../shared/models/portal-resources';
import { Observable } from 'rxjs/Observable';

export interface ColumnInformation {
  display: string; // The display text
  variable: string; // The  key that maps to the data property
  formatTo: string; // The type data for the column (date converts to fromNow etc)
}

@Component({
  selector: ComponentNames.tableFunctionMonitor,
  templateUrl: './table-function-monitor.component.html',
  styleUrls: ['./table-function-monitor.component.scss'],
})
export class TableFunctionMonitorComponent extends FeatureComponent<FunctionMonitorInfo> {
  @ViewChild(BusyStateComponent)
  busyState: BusyStateComponent;

  @Input()
  set functionMonitorInfoInput(functionMonitorInfo: FunctionMonitorInfo) {
    this.setBusy();
    this.setInput(functionMonitorInfo);
  }

  private _functionMonitorInfo: FunctionMonitorInfo;
  public columns: ColumnInformation[];
  public outputLog: string;
  public selectedRowId: string;

  public invocation: any;
  public details: any;
  public data: any;
  public selectedFunctionId: string;

  constructor(
    private _translateService: TranslateService,
    private _functionAppService: FunctionAppService,
    private _functionMonitorService: FunctionMonitorService,
    injector: Injector
  ) {
    super(ComponentNames.tableFunctionMonitor, injector, 'dashboard');
    this.featureName = ComponentNames.functionMonitor;
    this._setColumns();
  }

  private _setColumns(): void {
    this.columns = [
      {
        display: this._translateService.instant(PortalResources.functionMonitorTable_functionColumn),
        variable: 'functionDisplayTitle',
        formatTo: 'text',
      },
      {
        display: this._translateService.instant(PortalResources.functionMonitorTable_statusColumn),
        variable: 'status',
        formatTo: 'icon',
      },
      {
        display: this._translateService.instant(PortalResources.functionMonitorTable_detailsColumn),
        variable: 'whenUtc',
        formatTo: 'datetime',
      },
      {
        display: this._translateService.instant(PortalResources.functionMonitorTable_durationColumn),
        variable: 'duration',
        formatTo: 'number',
      },
    ];
  }

  protected setup(functionMonitorInfoInputEvent: Observable<FunctionMonitorInfo>) {
    return functionMonitorInfoInputEvent
      .switchMap(functionMonitorInfo => {
        this._functionMonitorInfo = functionMonitorInfo;

        return this._functionAppService
          .getFunctionHostStatus(functionMonitorInfo.functionAppContext)
          .flatMap(functionHost =>
            this._functionMonitorService.getDataForSelectedFunction(
              functionMonitorInfo.functionAppContext,
              functionMonitorInfo.functionName,
              functionHost.isSuccessful ? functionHost.result.id : ''
            )
          )
          .flatMap(data => {
            this.selectedFunctionId = !!data ? data.functionId : '';

            return !!data
              ? this._functionMonitorService.getInvocationsDataForSelectedFunction(functionMonitorInfo.functionAppContext, data.functionId)
              : Observable.of([]);
          });
      })
      .do(result => {
        if (result) {
          this.data = result;
        }
      });
  }

  public showDetails(rowData: FunctionInvocations) {
    this._functionMonitorService
      .getInvocationDetailsForSelectedInvocation(this._functionMonitorInfo.functionAppContext, rowData.id)
      .subscribe(invocationDetails => {
        if (!!invocationDetails) {
          this.invocation = invocationDetails.invocation;
          this.details = invocationDetails.parameters;
          this.selectedRowId = rowData.id;
          this.setOutputLogInfo(this.selectedRowId);
        }
      });
  }

  public setOutputLogInfo(rowId: string) {
    this._functionMonitorService
      .getOutputDetailsForSelectedInvocation(this._functionMonitorInfo.functionAppContext, rowId)
      .subscribe(outputData => {
        this.outputLog = outputData;
      });
  }

  public onKeyPressLogDetails(event: KeyboardEvent, rowData: FunctionInvocations) {
    if (event.keyCode === KeyCodes.enter) {
      this.showDetails(rowData);
    }
  }

  public refresh() {
    this.setInput(this._functionMonitorInfo);
  }
}
