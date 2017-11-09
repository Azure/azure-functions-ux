import { AppModule } from './../app.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HostEditorComponent } from './host-editor.component';

describe('HostEditorComponent', () => {
  let component: HostEditorComponent;
  let fixture: ComponentFixture<HostEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule(AppModule.moduleDefinition)
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HostEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
