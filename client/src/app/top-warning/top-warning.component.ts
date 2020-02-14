import { Component, OnInit } from '@angular/core';
import { GlobalStateService } from '../shared/services/global-state.service';
import { TopBarNotification } from './../top-bar/top-bar-models';

@Component({
  selector: 'top-warning',
  templateUrl: './top-warning.component.html',
  styleUrls: ['./top-warning.component.scss'],
})
export class TopWarningComponent implements OnInit {
  public notification: TopBarNotification = null;
  public isWarning = true;
  public cssClass = '';

  constructor(private _globalStateService: GlobalStateService) {}

  ngOnInit() {
    this._globalStateService.topBarNotificationsStream.subscribe(topBarNotifications => {
      this.notification =
        topBarNotifications && topBarNotifications.length > 0 ? topBarNotifications[topBarNotifications.length - 1] : null;
      this.isWarning = this.notification && this.notification.level !== 'info';
      this.cssClass = this.isWarning ? 'alert alert-warning alert-dismissible' : 'alert alert-warning alert-dismissible info-banner';
    });
  }

  notificationClick(notification: TopBarNotification) {
    if (notification.clickCallback) {
      notification.clickCallback();
    }
  }
}
