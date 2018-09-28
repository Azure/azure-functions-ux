import { StepBuildProviderComponent } from './step-build-provider.component';
import { ComponentFixture, fakeAsync, TestBed, async, tick } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DeploymentCenterStateManager } from '../wizard-logic/deployment-center-state-manager';
import { Injectable } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ScenarioService } from '../../../../shared/services/scenario/scenario.service';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { CacheService } from '../../../../shared/services/cache.service';
import { of } from 'rxjs/observable/of';

describe('StepBuildProviderComponent', () => {
    let buildStepTest: StepBuildProviderComponent;
    let testFixture: ComponentFixture<StepBuildProviderComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StepBuildProviderComponent],
            providers: [DeploymentCenterStateManager],
            imports: [TranslateModule.forRoot()],
        })
            .overrideComponent(StepBuildProviderComponent, {
                set: {
                    providers: [
                        { provide: DeploymentCenterStateManager, useClass: MockDeploymentCenterStateManager },
                        { provide: ScenarioService, useClass: MockScenarioService },
                        { provide: CacheService, useClass: MockCacheService },
                    ],
                },
            }).compileComponents();
    }));

    beforeEach(() => {
        testFixture = TestBed.createComponent(StepBuildProviderComponent);
        buildStepTest = testFixture.componentInstance;
        testFixture.detectChanges();
    });

    describe('init', () => {
        it('should create', fakeAsync(() => {
            expect(buildStepTest).toBeTruthy();
        }));

        it('should start with kudu', fakeAsync(() => {
            expect(buildStepTest.wizard.wizardValues.buildProvider).toBe('kudu');
        }));

        it('should change to vsts', fakeAsync(() => {
            const vstsCard = testFixture.debugElement.query(By.css('#vsts')).nativeElement;
            vstsCard.click();
            tick();
            expect(buildStepTest.wizard.wizardValues.buildProvider).toBe('vsts');
        }));
    });
});

class MockCacheService {

}
class MockScenarioService {
    checkScenario(id: string) {
        return {
            status: 'enabled',
            environmentName: 'any',
            id: id,
        };
    }
    checkScenarioAsync(id: string) {
        const result = {
            status: 'enabled',
            environmentName: 'any',
            id: id,
        };

        return of(result);
    }
}

@Injectable()
class MockDeploymentCenterStateManager {
    public wizardValues = {
        buildProvider: 'kudu',
    };

    public siteArmObj$ = new ReplaySubject<any>();
    constructor() {
        this.siteArmObj$.next({});
    }
}
