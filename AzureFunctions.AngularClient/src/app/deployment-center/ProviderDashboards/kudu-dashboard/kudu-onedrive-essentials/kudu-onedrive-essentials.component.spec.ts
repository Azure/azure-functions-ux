import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KuduOnedriveEssentialsComponent } from './kudu-onedrive-essentials.component';

describe('KuduOnedriveEssentialsComponent', () => {
  let component: KuduOnedriveEssentialsComponent;
  let fixture: ComponentFixture<KuduOnedriveEssentialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KuduOnedriveEssentialsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KuduOnedriveEssentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
