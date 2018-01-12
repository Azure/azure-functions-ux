import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureGithubComponent } from './configure-github.component';

describe('ConfigureGithubComponent', () => {
  let component: ConfigureGithubComponent;
  let fixture: ComponentFixture<ConfigureGithubComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigureGithubComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigureGithubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
