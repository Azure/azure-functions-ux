import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeploymnetCredentialsComponent } from './deploymnet-credentials.component';

describe('DeploymnetCredentialsComponent', () => {
  let component: DeploymnetCredentialsComponent;
  let fixture: ComponentFixture<DeploymnetCredentialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeploymnetCredentialsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeploymnetCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
