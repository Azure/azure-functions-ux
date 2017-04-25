import { Subject } from 'rxjs/Rx';
import { Component, OnInit, Input, Output } from '@angular/core';

@Component({
  selector: 'command',
  templateUrl: './command.component.html',
  styleUrls: ['./command.component.scss']
})
export class CommandComponent implements OnInit {

  @Input() displayText : string;
  @Input() iconUrl : string;
  @Input() disabled = false;
  @Output() click = new Subject<any>();

  constructor() { }

  ngOnInit() {
  }

  onClick(event : any){
    if(!this.disabled){
      this.click.next(event);
    }
  }

}
