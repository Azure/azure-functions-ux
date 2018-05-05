import { CommandBarComponent } from './command-bar.component';
import { CommonModule } from '@angular/common';
import { async } from 'q';
import { ComponentFixture, TestBed } from '@angular/core/testing';


describe('CommandBar', () => {
  let commandBar: CommandBarComponent;
  let testFixture: ComponentFixture<CommandBarComponent>;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CommandBarComponent],
      imports: [CommonModule]
    })
      .compileComponents();

  }));

  beforeEach(() => {
    testFixture = TestBed.createComponent(CommandBarComponent);
    commandBar = testFixture.componentInstance;
    testFixture.detectChanges();
  });

  describe('init', () => {
    it('should initialize component', () => {
      expect(commandBar).toBeTruthy();
    });
  });
});