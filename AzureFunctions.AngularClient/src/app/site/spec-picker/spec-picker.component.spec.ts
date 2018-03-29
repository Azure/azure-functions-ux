import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecPickerComponent } from './spec-picker.component';

describe('SpecPickerComponent', () => {
  let component: SpecPickerComponent;
  let fixture: ComponentFixture<SpecPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecPickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
