import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureVstsSourceComponent } from './configure-vsts-source.component';

describe('ConfigureVstsSourceComponent', () => {
  let component: ConfigureVstsSourceComponent;
  let fixture: ComponentFixture<ConfigureVstsSourceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigureVstsSourceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigureVstsSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
