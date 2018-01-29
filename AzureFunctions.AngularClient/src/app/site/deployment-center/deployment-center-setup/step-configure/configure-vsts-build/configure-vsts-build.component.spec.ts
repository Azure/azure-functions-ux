import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureVstsBuildComponent } from './configure-vsts-build.component';

describe('ConfigureVstsBuildComponent', () => {
  let component: ConfigureVstsBuildComponent;
  let fixture: ComponentFixture<ConfigureVstsBuildComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigureVstsBuildComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigureVstsBuildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
