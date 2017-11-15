import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtensionInstallDetailComponent } from './extension-install-detail.component';

describe('ExtensionInstallDetailComponent', () => {
  let component: ExtensionInstallDetailComponent;
  let fixture: ComponentFixture<ExtensionInstallDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExtensionInstallDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtensionInstallDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
