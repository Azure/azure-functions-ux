import { ContainerConfigureComponent } from './container-configure.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ContainerSettingsManager } from '../container-settings-manager';
import { Injector } from '@angular/core';
import { BroadcastService } from '../../../shared/services/broadcast.service';
import { LogService } from '../../../shared/services/log.service';
import { MockLogService } from '../../../test/mocks/log.service.mock';
import { TelemetryService } from '../../../shared/services/telemetry.service';
import { MockTelemetryService } from '../../../test/mocks/telemetry.service.mock';
import { MockContainerSettingsManager } from '../mocks/container-settings-manager.mock';
import { ContainerHostComponent } from '../container-host/container-host.component';
import { ContainerImageSourceComponent } from '../container-image-source/container-image-source.component';
import { LoadImageDirective } from '../../../controls/load-image/load-image.directive';
import { MockDirective } from 'ng-mocks';

describe('ContainerConfigureComponent', () => {
    let component: ContainerConfigureComponent;
    let fixture: ComponentFixture<ContainerConfigureComponent>;
    let mockContainerSettingsManager: MockContainerSettingsManager;

    beforeEach(() => {
        TestBed
            .configureTestingModule({
                declarations: [
                    ContainerConfigureComponent,
                    ContainerHostComponent,
                    ContainerImageSourceComponent,
                    MockDirective(LoadImageDirective)
                ],
                imports: [
                    TranslateModule.forRoot()
                ],
                providers: [
                    BroadcastService,
                    Injector,
                    { provide: LogService, useClass: MockLogService },
                    { provide: TelemetryService, useClass: MockTelemetryService },
                    { provide: ContainerSettingsManager, useClass: MockContainerSettingsManager }
                ]
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ContainerConfigureComponent);
        component = fixture.componentInstance;
        mockContainerSettingsManager = TestBed.get(ContainerSettingsManager);

        spyOn(mockContainerSettingsManager, 'initialize').and.callThrough();
    });

    it('should create', () => {
        expect(component).toBeDefined();
    });
});
