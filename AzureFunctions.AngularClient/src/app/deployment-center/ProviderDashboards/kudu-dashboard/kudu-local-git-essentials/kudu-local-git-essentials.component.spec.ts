import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KuduLocalGitEssentialsComponent } from './kudu-local-git-essentials.component';

describe('KuduLocalGitEssentialsComponent', () => {
  let component: KuduLocalGitEssentialsComponent;
  let fixture: ComponentFixture<KuduLocalGitEssentialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KuduLocalGitEssentialsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KuduLocalGitEssentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
