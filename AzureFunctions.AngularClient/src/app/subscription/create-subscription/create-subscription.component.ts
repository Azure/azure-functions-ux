import { Component, OnInit} from '@angular/core';
import { Guid } from './../../shared/Utilities/Guid';
import { GlobalStateService } from './../../shared/services/global-state.service';
import { CacheService } from './../../shared/services/cache.service';
import {Location} from '@angular/common';
import { LogService } from './../../shared/services/log.service';
import { LogCategories } from 'app/shared/models/constants';
import { FormControl, FormBuilder } from '@angular/forms';



@Component({
  selector: 'create-subscription',
  templateUrl: './create-subscription.component.html',
  styleUrls: ['./create-subscription.component.scss']
})
export class CreateSubscriptionComponent implements OnInit {
  planName: string;
  friendlySubName: FormControl;
  areInputsValid = true;
  invitationCode: FormControl;
  invitationCodeRequired = false;

  constructor(
    private _cacheService: CacheService,
    private _globalStateService: GlobalStateService,
    private _location: Location,
    private _logService: LogService,
    fb: FormBuilder
  ) {
    this.friendlySubName = fb.control('');
    this.invitationCode = fb.control('');
  }
  ngOnInit() {
  }

  onCreate() {
    const id = `/subscriptions/${Guid.newGuid()}`;
    const body = {
      planName: this.planName,
      displayName: this.friendlySubName.value,
      invitationCode: this.invitationCode.value,
    };

    this._globalStateService.setBusyState();
    this._cacheService.putArm(id, null, body)
      .subscribe(r => {
        this._globalStateService.clearBusyState();
        this._location.back();
      }, error => {
        this._logService.error(LogCategories.subsCriptions, '/create-subscriptions', error);
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
    // BUGBUG : RDBug 10600949:[Functions]Add validation for invitation code when creating subscription
    this.areInputsValid = true;
  }
}

