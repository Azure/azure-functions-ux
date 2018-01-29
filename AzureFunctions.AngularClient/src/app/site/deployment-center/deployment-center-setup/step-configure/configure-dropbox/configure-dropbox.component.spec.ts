import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureDropboxComponent } from './configure-dropbox.component';

describe('ConfigureDropboxComponent', () => {
  let component: ConfigureDropboxComponent;
  let fixture: ComponentFixture<ConfigureDropboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigureDropboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigureDropboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
