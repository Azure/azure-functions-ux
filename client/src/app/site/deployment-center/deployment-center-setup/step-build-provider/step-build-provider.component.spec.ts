import { StepBuildProviderComponent } from './step-build-provider.component';
import { ComponentFixture, fakeAsync, TestBed, async, tick } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DeploymentCenterStateManager } from '../wizard-logic/deployment-center-state-manager';
import { Injectable } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('StepBuildProviderComponent', () => {
    let buildStepTest: StepBuildProviderComponent;
    let testFixture: ComponentFixture<StepBuildProviderComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StepBuildProviderComponent],
            providers: [DeploymentCenterStateManager],
            imports: [TranslateModule.forRoot()]
        })
            .overrideComponent(StepBuildProviderComponent, {
                set: {
                    providers: [
                        { provide: DeploymentCenterStateManager, useClass: MockDeploymentCenterStateManager }
                    ]
                }
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

@Injectable()
class MockDeploymentCenterStateManager {
    public wizardValues = {
        buildProvider: 'kudu'
    };
}
