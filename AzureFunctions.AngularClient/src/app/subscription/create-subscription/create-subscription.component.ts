import { Component, OnInit} from '@angular/core';
import { Guid } from './../../shared/Utilities/Guid';
import { GlobalStateService } from './../../shared/services/global-state.service';
import { CacheService } from './../../shared/services/cache.service';


@Component({
  selector: 'create-subscription',
  templateUrl: './create-subscription.component.html',
  styleUrls: ['./create-subscription.component.scss']
})
export class CreateSubscriptionComponent implements OnInit {
  planName: string;
  friendlySubName: string;
  areInputsValid = true;
  invitationCode: string;
  invitationCodeRequired = false;
  constructor(
    private _cacheService: CacheService,    
    private _globalStateService: GlobalStateService    
  ) {

  }
  ngOnInit() {
  }

  onCreate() {
    let id = `/subscriptions/${Guid.newGuid()}`;
    let body = {
      planname: this.planName,
      displayname: this.friendlySubName,
      invitationcode: this.invitationCode,
    };

    this._globalStateService.setBusyState();
    this._cacheService.putArm(id, null, body)
      .subscribe(r => {
        this._globalStateService.clearBusyState();
      }, error => {
        this._globalStateService.clearBusyState();
      }); 
  }

  invitationCodeChanged() {
    this.validate();
  }

  planNameChanged(planName: string) {
    this.planName = planName;
  }

  invitationCodeRequiredChanged(invitationCodeRequired: boolean) {
    this.invitationCodeRequired = invitationCodeRequired;
  }

  validate() {
    //BUGBUG : RDBug 10600949:[Functions]Add validation for invitation code when creating subscription
    this.areInputsValid = true;
  }
}

