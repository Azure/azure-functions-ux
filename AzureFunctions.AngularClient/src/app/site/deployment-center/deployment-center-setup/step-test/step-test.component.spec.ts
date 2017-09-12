import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StepTestComponent } from './step-test.component';

describe('StepTestComponent', () => {
  let component: StepTestComponent;
  let fixture: ComponentFixture<StepTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StepTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
