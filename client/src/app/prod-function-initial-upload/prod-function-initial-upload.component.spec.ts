import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdFunctionInitialUploadComponent } from './prod-function-initial-upload.component';

describe('ProdFunctionInitialUploadComponent', () => {
  let component: ProdFunctionInitialUploadComponent;
  let fixture: ComponentFixture<ProdFunctionInitialUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProdFunctionInitialUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProdFunctionInitialUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
