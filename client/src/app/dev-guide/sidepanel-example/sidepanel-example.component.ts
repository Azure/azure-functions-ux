import { Component } from '@angular/core';
import { HighlightService } from '../highlight.service';

@Component({
  selector: 'app-sidepanel-example',
  templateUrl: './sidepanel-example.component.html',
  styleUrls: ['./sidepanel-example.component.scss'],
})
export class SidepanelExampleComponent {
  public opened = false;
  public backdropEnabled = true;

  constructor(highlight: HighlightService) {
    this.htmlCode = highlight.highlightString(this.htmlCode, 'html');
    this.typescriptCode = highlight.highlightString(this.typescriptCode, 'typescript');
    this.scssCode = highlight.highlightString(this.scssCode, 'scss');
  }

  public toggleSidebar() {
    this.opened = !this.opened;
  }

  public toggleBackdrop() {
    this.backdropEnabled = !this.backdropEnabled;
  }

  // tslint:disable-next-line:member-ordering
  public htmlCode = `
<ng-sidebar-container style="height: 100vh; width: 100vw">
  <!-- A sidebar -->
  <ng-sidebar #sidebar [(opened)]="opened" mode="over" position="right" [closeOnClickOutside]="backdropEnabled" [trapFocus]="false"
    [autoFocus]="true" sidebarClass="sidebar" ariaLabel="Accessibility FTW" [animate]="true" [showBackdrop]="backdropEnabled">
    <button (click)="toggleBackdrop()">Toggle backdrop</button>
  </ng-sidebar>

  <!-- Page content -->
  <div ng-sidebar-content>
    <button class="custom-button" (click)="toggleSidebar()">Toggle sidebar</button>
    <button class="custom-button" (click)="toggleBackdrop()">Toggle backdrop</button>
  </div>
</ng-sidebar-container>  
`;

  // tslint:disable-next-line:member-ordering
  public typescriptCode = `
  export class SidepanelExampleComponent {
    public opened = false;
    public backdropEnabled = true;

    constructor() { }
  
    public toggleSidebar() {
      this.opened = !this.opened;
    }
  
    public toggleBackdrop() {
      this.backdropEnabled = !this.backdropEnabled;
    }
  }  
  `;

  // tslint:disable-next-line:member-ordering
  public scssCode = `
.sidebar {
  background-color: $body-bg-color;

  width: 50vw;

  &.ng-sidebar--opened.ng-sidebar--push {
    border-left: $border;
  }
}
  `;
}
