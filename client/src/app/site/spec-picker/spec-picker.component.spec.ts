import { Observable } from 'rxjs/Observable';
import { MockTelemetryService } from './../../test/mocks/telemetry.service.mock';
import { MockBroadcastService } from './../../test/mocks/broadcast.service.mock';
import { BroadcastService } from './../../shared/services/broadcast.service';
import { MockPortalService } from './../../test/mocks/portal.service.mock';
import { PortalService } from 'app/shared/services/portal.service';
import { AuthzService } from './../../shared/services/authz.service';
import { MockAuthzService } from './../../test/mocks/authz.service.mock';
import { RemoveSpacesPipe } from './../../shared/pipes/remove-spaces.pipe';
import { SpecListComponent } from './spec-list/spec-list.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SpecPickerComponent } from './spec-picker.component';
import { LoadImageDirective } from '../../controls/load-image/load-image.directive';
import { MockDirective } from 'ng-mocks';
import { InfoBoxComponent } from '../../controls/info-box/info-box.component';
import { SpecFeatureListComponent } from './spec-feature-list/spec-feature-list.component';
import { TranslateModule } from '@ngx-translate/core';
import { LogService } from '../../shared/services/log.service';
import { MockLogService } from '../../test/mocks/log.service.mock';
import { TelemetryService } from '../../shared/services/telemetry.service';
import { SpecPickerInput, NewPlanSpecPickerData, PlanPriceSpecManager } from './price-spec-manager/plan-price-spec-manager';
import { PortalResources } from '../../shared/models/portal-resources';
import { GroupTabsComponent } from '../../controls/group-tabs/group-tabs.component';
import { MockPlanService } from '../../test/mocks/plan.service.mock';
import { PlanService } from '../../shared/services/plan.service';

describe('SpecPickerComponent', () => {
    let component: SpecPickerComponent;
    let fixture: ComponentFixture<SpecPickerComponent>;
    let priceSpecManager: PlanPriceSpecManager;
    const subscriptionId = 'mysub';
    const planName = 'myplan';
    const planResourceId = `/subscriptions/${subscriptionId}/resourcegroups/myrg/providers/microsoft.web/serverfarms/${planName}`;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                SpecPickerComponent,
                InfoBoxComponent,
                SpecListComponent,
                SpecFeatureListComponent,
                RemoveSpacesPipe,
                GroupTabsComponent,
                MockDirective(LoadImageDirective),
            ],
            imports: [TranslateModule.forRoot()],
            providers: [
                { provide: AuthzService, useClass: MockAuthzService },
                { provide: PortalService, useClass: MockPortalService },
                { provide: PlanService, useClass: MockPlanService },
                { provide: BroadcastService, useClass: MockBroadcastService },
                { provide: LogService, useClass: MockLogService },
                { provide: TelemetryService, useClass: MockTelemetryService },
                PlanPriceSpecManager,
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SpecPickerComponent);
        component = fixture.componentInstance;
        priceSpecManager = TestBed.get(PlanPriceSpecManager);

        spyOn(priceSpecManager, 'resetGroups').and.callFake(() => {
            return;
        });

        spyOn(priceSpecManager, 'cleanUpGroups').and.callFake(() => {
            return;
        });

        spyOn(priceSpecManager, 'getSpecCosts').and.callFake(() => {
            return Observable.of(true);
        });

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeDefined();
    });

    it('should initialize in Ibiza', () => {
        const input = {
            resourceId: planResourceId,
            dashboardType: null,
            node: null,
            data: {
                id: planResourceId,
                data: null,
                specPicker: component,
            },
        };

        spyOn(priceSpecManager, 'initialize').and.callFake(() => {
            return Observable.of(null);
        });

        spyOn(priceSpecManager, 'checkAccess').and.callFake(() => {
            return Observable.of(true);
        });

        component.viewInfoInput = input;
        expect(priceSpecManager.initialize).toHaveBeenCalledWith(input.data);
        expect(priceSpecManager.getSpecCosts).toHaveBeenCalled();
        expect(priceSpecManager.cleanUpGroups).toHaveBeenCalled();
        expect(priceSpecManager.checkAccess).toHaveBeenCalled();
        expect(component.shieldEnabled).toBeFalsy();
        expect(component.statusMessage).toBeNull();
    });

    it('should initialize as a tab in Functions', () => {
        const input = {
            resourceId: planResourceId,
            dashboardType: null,
            node: null,
            data: null,
        };

        spyOn(priceSpecManager, 'initialize').and.callFake(() => {
            return Observable.of(null);
        });

        spyOn(priceSpecManager, 'checkAccess').and.callFake(() => {
            return Observable.of(true);
        });

        component.viewInfoInput = input;

        const actualInput = <SpecPickerInput<NewPlanSpecPickerData>>(<jasmine.Spy>priceSpecManager.initialize).calls.argsFor(0)[0];
        expect(actualInput.id).toEqual(planResourceId);
        expect(actualInput.data).toBeNull();
        expect(actualInput.specPicker).toEqual(component);
        expect(priceSpecManager.getSpecCosts).toHaveBeenCalled();
        expect(priceSpecManager.cleanUpGroups).toHaveBeenCalled();
        expect(component.shieldEnabled).toBeFalsy();
        expect(component.statusMessage).toBeNull();
    });

    it('should show plan write permission error', () => {
        const input = {
            resourceId: planResourceId,
            dashboardType: null,
            node: null,
            data: {
                id: planResourceId,
                data: null,
                specPicker: component,
            },
        };

        const authZService: MockAuthzService = TestBed.get(AuthzService);
        spyOn(authZService, 'hasPermission').and.callFake(() => {
            return Observable.of(false);
        });

        spyOn(authZService, 'hasReadOnlyLock').and.callFake(() => {
            return Observable.of(false);
        });

        component.viewInfoInput = input;

        expect(component.shieldEnabled).toBeTruthy();
        expect(component.statusMessage).not.toBeNull();
        expect(component.statusMessage.level).toEqual('error');
        expect(component.statusMessage.message).toEqual(PortalResources.pricing_noWritePermissionsOnPlanFormat);
    });

    it('should show plan read lock error', () => {
        const input = {
            resourceId: planResourceId,
            dashboardType: null,
            node: null,
            data: {
                id: planResourceId,
                data: null,
                specPicker: component,
            },
        };

        const authZService: MockAuthzService = TestBed.get(AuthzService);
        spyOn(authZService, 'hasPermission').and.callFake(() => {
            return Observable.of(true);
        });

        spyOn(authZService, 'hasReadOnlyLock').and.callFake(() => {
            return Observable.of(true);
        });

        component.viewInfoInput = input;

        expect(component.shieldEnabled).toBeTruthy();
        expect(component.statusMessage).not.toBeNull();
        expect(component.statusMessage.level).toEqual('error');
        expect(component.statusMessage.message).toEqual(PortalResources.pricing_planReadonlyLockFormat);
    });
});
