import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadFunctionAppContentComponent } from './download-function-app-content.component';

describe('DownloadFunctionAppContentComponent', () => {
  let component: DownloadFunctionAppContentComponent;
  let fixture: ComponentFixture<DownloadFunctionAppContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DownloadFunctionAppContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadFunctionAppContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
