import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StepBuildProviderComponent } from './step-build-provider.component';

describe('StepBuildProviderComponent', () => {
  let component: StepBuildProviderComponent;
  let fixture: ComponentFixture<StepBuildProviderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StepBuildProviderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepBuildProviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
