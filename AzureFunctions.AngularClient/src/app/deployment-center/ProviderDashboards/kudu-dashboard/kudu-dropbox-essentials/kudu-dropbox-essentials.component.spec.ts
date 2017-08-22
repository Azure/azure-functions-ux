import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KuduDropboxEssentialsComponent } from './kudu-dropbox-essentials.component';

describe('KuduDropboxEssentialsComponent', () => {
  let component: KuduDropboxEssentialsComponent;
  let fixture: ComponentFixture<KuduDropboxEssentialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KuduDropboxEssentialsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KuduDropboxEssentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
