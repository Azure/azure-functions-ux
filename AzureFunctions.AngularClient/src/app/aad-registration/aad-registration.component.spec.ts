import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AadRegistrationComponent } from './aad-registration.component';

describe('AadRegistrationComponent', () => {
  let component: AadRegistrationComponent;
  let fixture: ComponentFixture<AadRegistrationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AadRegistrationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AadRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
