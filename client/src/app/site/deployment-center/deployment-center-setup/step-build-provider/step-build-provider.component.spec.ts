import { StepBuildProviderComponent } from './step-build-provider.component';
import { ComponentFixture, fakeAsync, TestBed, async, tick } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DeploymentCenterStateManager } from '../wizard-logic/deployment-center-state-manager';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/first';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/observable/timer';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/zip';
import 'rxjs/add/operator/concatMap';
import 'rxjs/observable/interval';
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
