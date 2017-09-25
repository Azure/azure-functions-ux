import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppSettingsShellComponent } from './app-settings-shell.component';

describe('AppSettingsShellComponent', () => {
  let component: AppSettingsShellComponent;
  let fixture: ComponentFixture<AppSettingsShellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppSettingsShellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppSettingsShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
