import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockContainerSettingsManager } from '../mocks/container-settings-manager.mock';
import { MockDirective } from 'ng-mocks';
import { LoadImageDirective } from '../../../controls/load-image/load-image.directive';
import { TranslateModule } from '@ngx-translate/core';
import { BroadcastService } from '../../../shared/services/broadcast.service';
import { Injector } from '@angular/core';
import { LogService } from '../../../shared/services/log.service';
import { MockLogService } from '../../../test/mocks/log.service.mock';
import { TelemetryService } from '../../../shared/services/telemetry.service';
import { MockTelemetryService } from '../../../test/mocks/telemetry.service.mock';
import { ContainerSettingsManager } from '../container-settings-manager';
import { ContainerImageSourceComponent } from './container-image-source.component';

describe('ContainerIamgeSourceComponent', () => {
    let component: ContainerImageSourceComponent;
    let fixture: ComponentFixture<ContainerImageSourceComponent>;
    let mockContainerSettingsManager: MockContainerSettingsManager;

    beforeEach(() => {
        TestBed
            .configureTestingModule({
                declarations: [
                    ContainerImageSourceComponent,
                    MockDirective(LoadImageDirective),
                ],
                imports: [
                    TranslateModule.forRoot()
                ],
                providers: [
                    BroadcastService,
                    Injector,
                    { provide: LogService, useClass: MockLogService },
                    { provide: TelemetryService, useClass: MockTelemetryService },
                    { provide: ContainerSettingsManager, useClass: MockContainerSettingsManager },
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ContainerImageSourceComponent);
        component = fixture.componentInstance;
        mockContainerSettingsManager = TestBed.get(ContainerSettingsManager);

        spyOn(mockContainerSettingsManager, 'resetContainers').and.callThrough();
        spyOn(mockContainerSettingsManager, 'initialize').and.callThrough();
    });

    it('should create', () => {
        expect(component).toBeDefined();
    });
});
