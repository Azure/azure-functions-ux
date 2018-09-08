import { ContainerContinuousDeliveryComponent } from './container-continuos-delivery.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContainerSettingsManager } from './../../container-settings-manager';
import { LoadImageDirective } from './../../../../controls/load-image/load-image.directive';
import { MockDirective } from 'ng-mocks';
import { TranslateModule } from '@ngx-translate/core';
import { BroadcastService } from './../../../../shared/services/broadcast.service';
import { Injector } from '@angular/core';
import { LogService } from './../../../../shared/services/log.service';
import { MockLogService } from './../../../../test/mocks/log.service.mock';
import { TelemetryService } from './../../../../shared/services/telemetry.service';
import { MockTelemetryService } from './../../../../test/mocks/telemetry.service.mock';

describe('ContainerContinuousDeliveryComponent', () => {
    let component: ContainerContinuousDeliveryComponent;
    let fixture: ComponentFixture<ContainerContinuousDeliveryComponent>;
    let containerSettingsManager: ContainerSettingsManager;

    beforeEach(() => {
        TestBed
            .configureTestingModule({
                declarations: [
                    ContainerContinuousDeliveryComponent,
                    MockDirective(LoadImageDirective),
                ],
                imports: [
                    TranslateModule.forRoot(),
                ],
                providers: [
                    BroadcastService,
                    Injector,
                    ContainerSettingsManager,
                    { provide: LogService, useClass: MockLogService },
                    { provide: TelemetryService, useClass: MockTelemetryService },
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ContainerContinuousDeliveryComponent);
        component = fixture.componentInstance;
        containerSettingsManager = TestBed.get(ContainerSettingsManager);

        spyOn(containerSettingsManager, 'resetSettings').and.callThrough();
        spyOn(containerSettingsManager, 'initialize').and.callThrough();
    });

    it('should create', () => {
        expect(component).toBeDefined();
    });
});
