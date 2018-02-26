import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureLocalGitComponent } from './configure-local-git.component';

describe('ConfigureLocalGitComponent', () => {
  let component: ConfigureLocalGitComponent;
  let fixture: ComponentFixture<ConfigureLocalGitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigureLocalGitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigureLocalGitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
