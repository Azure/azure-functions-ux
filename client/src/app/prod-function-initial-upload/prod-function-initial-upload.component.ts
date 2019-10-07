import { Component, EventEmitter } from '@angular/core';
import { SiteService } from '../shared/services/site.service';
import { CacheService } from '../shared/services/cache.service';
import { Constants, ARMApiVersions } from '../shared/models/constants';
import { UploadOutput, UploadFile, UploadInput, UploaderOptions } from 'ngx-uploader';
import { Observable } from 'rxjs/Observable';
import { BroadcastService } from '../shared/services/broadcast.service';
import { BroadcastEvent } from '../shared/models/broadcast-event';
import { TreeViewInfo } from '../tree-view/models/tree-view-info';
import { Guid } from '../shared/Utilities/Guid';
import { DashboardType } from '../tree-view/models/dashboard-type';
@Component({
  selector: 'app-prod-function-initial-upload',
  templateUrl: './prod-function-initial-upload.component.html',
  styleUrls: ['./prod-function-initial-upload.component.scss'],
})
export class ProdFunctionInitialUploadComponent {
  options: UploaderOptions;
  file: UploadFile;
  uploadInput: EventEmitter<UploadInput>;
  public show = false;
  public storageAccountString = '';
  public blobSasUrl = '';
  public resourceId = '';
  loading = false;
  private _containerName = '';
  constructor(private _siteService: SiteService, private _cacheService: CacheService, broadCastService: BroadcastService) {
    broadCastService
      .getEvents<TreeViewInfo<any>>(BroadcastEvent.TreeNavigation)
      .filter(
        r =>
          !!r.resourceId &&
          r.resourceId.toLowerCase().indexOf('/microsoft.web/sites') > -1 &&
          r.dashboardType === DashboardType.AppDashboard
      )
      .map(view => {
        return view.resourceId;
      })
      .switchMap(r => {
        this.resourceId = r;
        this._containerName = Guid.newTinyGuid().toLowerCase();
        return _siteService.getAppSettings(r);
      })
      .map(r => {
        if (r.isSuccessful) {
          this.storageAccountString = r.result.properties.AzureWebJobsStorage;
          this.show = !r.result.properties.WEBSITE_USE_ZIP && !!this.storageAccountString && !!r.result.properties.NEW_PROD_FUNCTION;
          return this.storageAccountString;
        } else {
          this.show = false;
          return Observable.of(null);
        }
      })
      .switchMap(r => {
        if (r) {
          return _cacheService.post(`${Constants.serviceHost}api/getBlobSasUri`, true, null, {
            connectionString: r,
            containerName: this._containerName,
          });
        } else {
          return Observable.of(null);
        }
      })
      .subscribe(
        r => {
          if (r) {
            this.blobSasUrl = r.json().sasUrl;
          }
        },
        err => {
          this.show = false;
        }
      );

    this.file = null;
    this.uploadInput = new EventEmitter<UploadInput>();
  }

  onUploadOutput(output: UploadOutput): void {
    if (output.type === 'allAddedToQueue') {
      const event: UploadInput = {
        type: 'uploadFile',
        url: `${Constants.serviceHost}api/upload-file`,
        method: 'POST',
        file: this.file,
        headers: {
          connectionstring: this.storageAccountString,
          containername: this._containerName,
        },
      };
      this.uploadInput.emit(event);
      this.loading = true;
    } else if (output.type === 'addedToQueue' && typeof output.file !== 'undefined') {
      this.file = output.file;
    } else if (output.type === 'uploading' && typeof output.file !== 'undefined') {
      this.file = output.file;
    } else if (output.type === 'done') {
      this.updateAppSettings();
    }
  }

  updateAppSettings(): void {
    this._siteService
      .getAppSettings(this.resourceId)
      .map(r => {
        const settings = r.result.properties;
        settings.WEBSITE_USE_ZIP = this.blobSasUrl;
        delete settings.NEW_PROD_FUNCTION;
        return r.result;
      })
      .switchMap(r => this._cacheService.putArm(`${this.resourceId}/config/appSettings`, ARMApiVersions.antaresApiVersion20181101, r))
      .subscribe(r => {
        this.show = false;
        this.loading = false;
      });
  }
}
