import { Component, OnInit, Output, Input } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss']
})
export class SearchBoxComponent implements OnInit {
    @Input() placeholder: string;
    @Input() value: string = "";
    @Input() warning: boolean = false;
    @Output() onInputChange = new Subject<any>();
    @Output() onClear = new Subject<void>();

  constructor() { }

  ngOnInit() {
  }

  onKeyUp(event: any) {
      this.onInputChange.next(event);
  }

  onClearClick(event: any) {
      this.value = "";
      this.onClear.next(null);
  }

}
