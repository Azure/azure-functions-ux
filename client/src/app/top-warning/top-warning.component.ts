import { Component, OnInit } from '@angular/core';
import { GlobalStateService } from '../shared/services/global-state.service';
import { TopBarNotification } from './../top-bar/top-bar-models';

@Component({
  selector: 'top-warning',
  templateUrl: './top-warning.component.html',
  styleUrls: ['./top-warning.component.scss'],
})
export class TopWarningComponent implements OnInit {
  public notifications: TopBarNotification[] = [];

  constructor(private _globalStateService: GlobalStateService) {}

  ngOnInit() {
    this._globalStateService.topBarNotificationsStream.subscribe(topBarNotifications => {
      this.notifications = topBarNotifications;
    });
  }

  notificationClick(notification: TopBarNotification) {
    if (notification.clickCallback) {
      notification.clickCallback();
    }
  }
}
