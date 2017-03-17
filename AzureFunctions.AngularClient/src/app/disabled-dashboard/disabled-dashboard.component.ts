import { GlobalStateService } from './../shared/services/global-state.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'disabled-dashboard',
  templateUrl: './disabled-dashboard.component.html',
  styleUrls: ['./disabled-dashboard.component.scss']
})
export class DisabledDashboardComponent implements OnInit {
  public message : string = null;

  constructor(globalStateService : GlobalStateService) {
    globalStateService.disabledMessage.subscribe(message =>{
      this.message = message;
    })
  }

  ngOnInit() {
  }
}
