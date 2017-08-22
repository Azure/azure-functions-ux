import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KuduGithubEssentialsComponent } from './kudu-github-essentials.component';

describe('KuduGithubEssentialsComponent', () => {
  let component: KuduGithubEssentialsComponent;
  let fixture: ComponentFixture<KuduGithubEssentialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KuduGithubEssentialsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KuduGithubEssentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
