import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockDirective } from 'ng-mocks';
import { LoadImageDirective } from './../../../../controls/load-image/load-image.directive';
import { TranslateModule } from '@ngx-translate/core';
import { BroadcastService } from './../../../../shared/services/broadcast.service';
import { Injector, Injectable } from '@angular/core';
import { LogService } from './../../../../shared/services/log.service';
import { MockLogService } from './../../../../test/mocks/log.service.mock';
import { TelemetryService } from './../../../../shared/services/telemetry.service';
import { MockTelemetryService } from './../../../../test/mocks/telemetry.service.mock';
import { ContainerSettingsManager } from './../../container-settings-manager';
import { ContainerImageSourceACRComponent } from './container-image-source-acr.component';
import { ContainerACRService } from '../../../../shared/services/container-acr.service';

describe('ContainerImageSourceACRComponent', () => {
    let component: ContainerImageSourceACRComponent;
    let fixture: ComponentFixture<ContainerImageSourceACRComponent>;
    let containerSettingsManager: ContainerSettingsManager;

    beforeEach(() => {
        TestBed
            .configureTestingModule({
                declarations: [
                    ContainerImageSourceACRComponent,
                    MockDirective(LoadImageDirective),
                ],
                imports: [
                    TranslateModule.forRoot()
                ],
                providers: [
                    BroadcastService,
                    Injector,
                    ContainerSettingsManager,
                    { provide: LogService, useClass: MockLogService },
                    { provide: TelemetryService, useClass: MockTelemetryService },
                    { provide: ContainerACRService, userClass: MockContainerACRService },
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ContainerImageSourceACRComponent);
        component = fixture.componentInstance;
        containerSettingsManager = TestBed.get(ContainerSettingsManager);

        spyOn(containerSettingsManager, 'resetSettings').and.callThrough();
        spyOn(containerSettingsManager, 'initialize').and.callThrough();
    });

    it('should create', () => {
        expect(component).toBeDefined();
    });
});

@Injectable()
export class MockContainerACRService {
    constructor() {
    }

    getRegistries(subscriptionId: string) {}
    getCredentials(resourceUri: string, registry: string) {}
    getRepositories(subscriptionId: string, loginServer: string, username: string, password: string) {}
    getTags(subscriptionId: string, loginServer: string, repository: string, username: string, password: string) {}
}
