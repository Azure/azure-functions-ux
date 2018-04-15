import { Component, EventEmitter } from '@angular/core';
import { GlobalStateService } from '../shared/services/global-state.service';
import { SiteService } from '../shared/services/site.service';
import { CacheService } from '../shared/services/cache.service';
import { Constants } from '../shared/models/constants';
import { UploadOutput, UploadFile, UploadInput } from 'ngx-uploader';
@Component({
  selector: 'app-prod-function-initial-upload',
  templateUrl: './prod-function-initial-upload.component.html',
  styleUrls: ['./prod-function-initial-upload.component.scss']
})
export class ProdFunctionInitialUploadComponent {

  options = {
    concurrency: 0,
    allowedContentTypes: ['application/zip']
  };

  file: UploadFile;
  uploadInput: EventEmitter<UploadInput>;
  public show = false;
  public storageAccountString = '';
  public blobSasUrl = '';
  public resourceId = '';
  loading = false;
  constructor(private siteService: SiteService, private cacheService: CacheService, private globalStateService: GlobalStateService) {
    globalStateService.resourceId$
      .filter(r => !!r)
      .switchMap(r => {
        this.resourceId = r;
        return siteService.getAppSettings(r);
      })
      .map(r => {
        this.storageAccountString = r.result.properties.AzureWebJobsStorage;
        this.show = !r.result.properties.WEBSITE_USE_ZIP;
        return this.storageAccountString;
      })
      .switchMap(r => cacheService.post(`${Constants.serviceHost}api/getBlobSasUri`, true, null, {
        connectionString: r
      }))
      .subscribe(r => {
        this.blobSasUrl = r.json().sasUrl;
      });

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
          'connectionString': this.storageAccountString
        }
      };
      this.uploadInput.emit(event);
      this.loading = true;
      this.globalStateService.setBusyState('loading');
    } else if (output.type === 'addedToQueue' && typeof output.file !== 'undefined') {
      this.file = output.file;
    } else if (output.type === 'uploading' && typeof output.file !== 'undefined') {
      this.file = output.file;
    } else if (output.type === 'done') {
      this.updateAppSettings();
    }
  }

  updateAppSettings(): void {
    this.siteService.getAppSettings(this.resourceId)
      .map(r => {
        const settings = r.result.properties;
        // delete settings.WEBSITE_CONTENTAZUREFILECONNECTIONSTRING;
        // delete settings.WEBSITE_CONTENTSHARE;
        settings.WEBSITE_USE_ZIP = this.blobSasUrl;
        return r.result;
      })
      .switchMap(r => this.cacheService.putArm(`${this.resourceId}/config/appSettings`, '2015-08-01', r))
      .subscribe(r => {
        this.show = false;
        this.loading = false;
        this.globalStateService.clearBusyState();
      });
  }
}
