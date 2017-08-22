import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KuduVstsEssentialsComponent } from './kudu-vsts-essentials.component';

describe('KuduVstsEssentialsComponent', () => {
  let component: KuduVstsEssentialsComponent;
  let fixture: ComponentFixture<KuduVstsEssentialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KuduVstsEssentialsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KuduVstsEssentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
