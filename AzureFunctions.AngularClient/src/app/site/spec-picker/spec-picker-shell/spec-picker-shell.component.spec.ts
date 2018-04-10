import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecPickerFeatureWrapperComponent } from './spec-picker-feature-wrapper.component';

describe('SpecPickerFeatureWrapperComponent', () => {
  let component: SpecPickerFeatureWrapperComponent;
  let fixture: ComponentFixture<SpecPickerFeatureWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecPickerFeatureWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecPickerFeatureWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
