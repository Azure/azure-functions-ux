import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtensionCheckerComponent } from './extension-checker.component';

describe('ExtensionCheckerComponent', () => {
  let component: ExtensionCheckerComponent;
  let fixture: ComponentFixture<ExtensionCheckerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExtensionCheckerComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtensionCheckerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
