import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StepConfigureComponent } from './step-configure.component';

describe('StepConfigureComponent', () => {
  let component: StepConfigureComponent;
  let fixture: ComponentFixture<StepConfigureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StepConfigureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepConfigureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
