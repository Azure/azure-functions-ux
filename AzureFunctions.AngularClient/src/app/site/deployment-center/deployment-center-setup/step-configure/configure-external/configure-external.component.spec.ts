import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureExternalComponent } from './configure-external.component';

describe('ConfigureExternalComponent', () => {
  let component: ConfigureExternalComponent;
  let fixture: ComponentFixture<ConfigureExternalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigureExternalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigureExternalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
