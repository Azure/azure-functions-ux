import { Component, OnInit } from '@angular/core';
import {GlobalStateService} from '../shared/services/global-state.service';
import {TranslateService} from 'ng2-translate/ng2-translate';

@Component({
  selector: 'api-details',
  templateUrl: './api-details.component.html',
  styleUrls: ['./api-details.component.scss']
})
export class ApiDetailsComponent implements OnInit {

  constructor (private _globalStateService: GlobalStateService,
    private _translateService: TranslateService) { }

  ngOnInit() {
  }

}
