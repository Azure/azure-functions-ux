import { Component, OnInit, Input } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'java-splash-page',
  templateUrl: './java-splash-page.component.html',
  styleUrls: ['./java-splash-page.component.scss']
})
export class JavaSplashPageComponent implements OnInit {
  @Input() setShowJavaSplashPage = new Subject<boolean>();

  constructor() {
  }

  ngOnInit() {

  };

  onClickOutside() {
    this.setShowJavaSplashPage.next(false);
  }
}
