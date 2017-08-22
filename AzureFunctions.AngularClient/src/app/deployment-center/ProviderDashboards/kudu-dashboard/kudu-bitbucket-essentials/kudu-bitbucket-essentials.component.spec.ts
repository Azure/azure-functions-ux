import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KuduBitbucketEssentialsComponent } from './kudu-bitbucket-essentials.component';

describe('KuduBitbucketEssentialsComponent', () => {
  let component: KuduBitbucketEssentialsComponent;
  let fixture: ComponentFixture<KuduBitbucketEssentialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KuduBitbucketEssentialsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KuduBitbucketEssentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
