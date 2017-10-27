import { AppModule } from './../../app.module';
/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionPlanPickerComponent } from './subscription-plan-picker.component';

describe('SubscriptionPlanPickerComponent', () => {
  let component: SubscriptionPlanPickerComponent;
  let fixture: ComponentFixture<SubscriptionPlanPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule(AppModule.moduleDefinition)
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionPlanPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
