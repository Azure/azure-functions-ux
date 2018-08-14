import { ContainerConfigureComponent } from './container-configure.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ContainerSettingsManager } from '../container-settings-manager';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { ContainerSettingsInput, ContainerSettingsData, Container, DockerComposeContainer } from '../container-settings';
import { Injector } from '@angular/core';
import { BroadcastService } from '../../../shared/services/broadcast.service';
import { LogService } from '../../../shared/services/log.service';
import { MockLogService } from '../../../test/mocks/log.service.mock';
import { TelemetryService } from '../../../shared/services/telemetry.service';
import { MockTelemetryService } from '../../../test/mocks/telemetry.service.mock';

describe('ContainerConfigureComponent', () => {
    let component: ContainerConfigureComponent;
    let fixture: ComponentFixture<ContainerConfigureComponent>;
    let mockContainerSettingsManager: MockContainerSettingsManager;

    beforeEach(() => {
        TestBed
            .configureTestingModule({
                declarations: [
                    ContainerConfigureComponent
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

    fit('should create', () => {
        expect(component).toBeDefined();
    });
});

class MockContainerSettingsManager {
    $selectedContainer: ReplaySubject<Container> = new ReplaySubject<Container>();

    initialize(inputs: ContainerSettingsInput<ContainerSettingsData>) {
        this.$selectedContainer.next(new DockerComposeContainer(TestBed.get(Injector)));
    }
}
