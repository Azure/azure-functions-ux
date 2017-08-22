import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KuduExternalGitEssentialsComponent } from './kudu-external-git-essentials.component';

describe('KuduExternalGitEssentialsComponent', () => {
  let component: KuduExternalGitEssentialsComponent;
  let fixture: ComponentFixture<KuduExternalGitEssentialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KuduExternalGitEssentialsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KuduExternalGitEssentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
