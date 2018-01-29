import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureOnedriveComponent } from './configure-onedrive.component';

describe('ConfigureOnedriveComponent', () => {
  let component: ConfigureOnedriveComponent;
  let fixture: ComponentFixture<ConfigureOnedriveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigureOnedriveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigureOnedriveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
