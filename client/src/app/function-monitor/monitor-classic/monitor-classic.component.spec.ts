import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MockComponent } from 'ng-mocks';
import { MonitorClassicComponent } from './../monitor-classic/monitor-classic.component';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { TranslateModule } from '@ngx-translate/core';
import { BroadcastService } from './../../shared/services/broadcast.service';
import { TelemetryService } from './../../shared/services/telemetry.service';
import { LogService } from './../../shared/services/log.service';
import { MockLogService } from './../../test/mocks/log.service.mock';
import { MockTelemetryService } from './../../test/mocks/telemetry.service.mock';
import { PortalService } from '../../shared/services/portal.service';
import { FunctionAggregates, FunctionMonitorInfo } from '../../shared/models/function-monitor';
import { FunctionAppContext } from '../../shared/function-app-context';
import { FunctionInfo } from '../../shared/models/function-info';
import { OpenBladeInfo, BladeResult } from '../../shared/models/portal';
import { TableFunctionMonitorComponent } from '../../table-function-monitor/table-function-monitor.component';
import { FunctionAppService } from '../../shared/services/function-app.service';
import { FunctionMonitorService } from '../../shared/services/function-monitor.service';
import { HttpResult } from '../../shared/models/http-result';
import { HostStatus } from '../../shared/models/host-status';
import { ArmObj } from '../../shared/models/arm/arm-obj';
import { Site } from '../../shared/models/arm/site';
import { errorIds } from '../../shared/models/error-ids';
import { MonitorConfigureComponent } from '../monitor-configure/monitor-configure.component';
import { AggregateBlockComponent } from '../../aggregate-block/aggregate-block.component';
import { CommandBarComponent } from '../../controls/command-bar/command-bar.component';
import { CommandComponent } from '../../controls/command-bar/command/command.component';

describe('MonitorClassicComponent', () => {
    let component: MonitorClassicComponent;
    let fixture: ComponentFixture<MonitorClassicComponent>;
    let functionMonitorInfo: FunctionMonitorInfo;

    const functionAppName = 'functionApp';
    const functionName = 'function';
    const functionAppResourceId1 = '/subscriptions/sub/resourceGroups/rg1/providers/Microsoft.Web/sites/functionApp';
    const functionAppResourceId2 = '/subscriptions/sub/resourceGroups/rg2/providers/Microsoft.Web/sites/functionApp';
    const siteUrl = 'https://functionApp.azurewebsites.net';
    const scmUrl = 'https://functionApp.scm.azurewebsites.net';

    beforeEach(async() => {
        TestBed
            .configureTestingModule({
                declarations: [
                    MonitorClassicComponent,
                    MockComponent(CommandBarComponent),
                    MockComponent(CommandComponent),
                    MockComponent(MonitorConfigureComponent),
                    MockComponent(AggregateBlockComponent),
                    MockComponent(TableFunctionMonitorComponent)
                ],
                providers: [
                    { provide: PortalService, useClass: MockPortalService },
                    { provide: FunctionAppService, useClass: MockFunctionAppService },
                    { provide: FunctionMonitorService, useClass: MockFunctionMonitorService },
                    { provide: TelemetryService, useClass: MockTelemetryService },
                    { provide: LogService, useClass: MockLogService },
                    BroadcastService,
                ],
                imports: [
                    TranslateModule.forRoot()
                ]
            })
            .compileComponents();
    });

    beforeEach(() => {
        const site = <ArmObj<Site>>{
            id: functionAppResourceId1,
            kind: 'functionapp',
            location: 'location',
            name: functionAppName,
            type: 'Microsoft.Web/sites',
            properties: null
        };

        const appContext: FunctionAppContext = {
            mainSiteUrl: siteUrl,
            scmUrl: scmUrl,
            urlTemplates: null,
            site: site
        };

        functionMonitorInfo = {
            functionAppContext: appContext,
            functionAppSettings: {},
            functionInfo: <FunctionInfo>{
                name: functionName,
                context: appContext
            },
            appInsightsResourceDescriptor: null,
            appInsightsFeatureEnabled: false
        };
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MonitorClassicComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('init', () => {

        beforeEach(() => {
            component['setInput'](functionMonitorInfo);
        });

        it('should create', () => {
            fixture.whenStable().then(() => {
                expect(component).toBeTruthy();
            });
        });
    });

    describe('with host status error', () => {
        beforeEach(() => {
            functionMonitorInfo.functionAppContext.site.id = functionAppResourceId1;

            component['setInput'](functionMonitorInfo);
        });

        it('should allow configure', () => {
            expect(component.shouldRenderMonitorConfigure).toBeTruthy();
            expect(component.monitorConfigureInfo).not.toBeNull();
            expect(component.monitorConfigureInfo).not.toBeUndefined();
            expect(component.monitorConfigureInfo.errorEvent).not.toBeNull();
            expect(component.monitorConfigureInfo.errorEvent).not.toBeUndefined();
        });
    });

    describe('with application insights not enabled for environment', () => {
        beforeEach(() => {
            functionMonitorInfo.functionAppContext.site.id = functionAppResourceId2;
            functionMonitorInfo.appInsightsFeatureEnabled = false;

            component['setInput'](functionMonitorInfo);
        });

        it('should allow configure', () => {
            expect(component.shouldRenderAppInsightsUpsell).toBeFalsy();
            expect(component.successAggregate).toEqual('10');
            expect(component.errorsAggregate).toEqual('20');
        });
    });

    describe('with application insights enabled for environment', () => {
        beforeEach(() => {
            functionMonitorInfo.functionAppContext.site.id = functionAppResourceId2;
            functionMonitorInfo.appInsightsFeatureEnabled = true;

            component['setInput'](functionMonitorInfo);
        });

        it('should allow configure', () => {
            expect(component.shouldRenderAppInsightsUpsell).toBeTruthy();
            expect(component.successAggregate).toEqual('10');
            expect(component.errorsAggregate).toEqual('20');
        });
    });

    @Injectable()
    class MockFunctionAppService {
        getFunctionHostStatus(context: FunctionAppContext): HttpResult<HostStatus> {
            const hostStatus = <HostStatus>{
                id: context.site.id,
                state: 'Running',
                version: '1.0',
                errors: []
            };

            if (context.site.id.startsWith(functionAppResourceId1)) {
                return <HttpResult<HostStatus>>{
                    isSuccessful: false,
                    error: {
                        errorId: errorIds.preconditionsErrors.clientCertEnabled
                    },
                    result: null
                };
            } else {
                return <HttpResult<HostStatus>>{
                    isSuccessful: true,
                    result: hostStatus
                };
            }
        }
    }

    @Injectable()
    class MockFunctionMonitorService {
        getDataForSelectedFunction(context: FunctionAppContext, functionInfo: FunctionInfo, host: string): HttpResult<FunctionAggregates> {
            const aggregates = <FunctionAggregates> {
                functionId: 'id',
                functionFullName: functionInfo.name,
                functionName: functionInfo.name,
                successCount: 10,
                failedCount: 20,
                isRunning: true
            };

            return <HttpResult<FunctionAggregates>>{
                isSuccessful: true,
                result: aggregates
            };
        }
    }

    @Injectable()
    class MockPortalService {
        public openBlade(bladeInfo: OpenBladeInfo, source: string): Observable<BladeResult<any>> {
            return Observable.of(null);
        }
    }
});
