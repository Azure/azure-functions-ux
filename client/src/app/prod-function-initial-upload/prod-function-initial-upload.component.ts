import { Component, EventEmitter } from '@angular/core';
import { GlobalStateService } from '../shared/services/global-state.service';
import { SiteService } from '../shared/services/site.service';
import { CacheService } from '../shared/services/cache.service';
import { Constants } from '../shared/models/constants';
import { UploadOutput, UploadFile, UploadInput, UploaderOptions } from 'ngx-uploader';
import { Observable } from 'rxjs/Observable';
@Component({
  selector: 'app-prod-function-initial-upload',
  templateUrl: './prod-function-initial-upload.component.html',
  styleUrls: ['./prod-function-initial-upload.component.scss']
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
  constructor(private siteService: SiteService, private cacheService: CacheService, globalStateService: GlobalStateService) {
    globalStateService.resourceId$
      .filter(r => !!r)
      .switchMap(r => {
        this.resourceId = r;
        return siteService.getAppSettings(r);
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


          return cacheService.post(`${Constants.serviceHost}api/getBlobSasUri`, true, null, {
            connectionString: r
          });
        } else {
          return Observable.of(null);
        }
      })
      .subscribe(r => {
        if (r) {
          this.blobSasUrl = r.json().sasUrl;
        }
      },
        err => {
          this.show = false;
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
    } else if (output.type === 'addedToQueue' && typeof output.file !== 'undefined') {
      this.file = output.file;
    } else if (output.type === 'uploading' && typeof output.file !== 'undefined') {
      this.file = output.file;
    }  else if (output.type === 'done') {
      this.updateAppSettings();
    }
  }

  updateAppSettings(): void {
    this.siteService.getAppSettings(this.resourceId)
      .map(r => {
        const settings = r.result.properties;
        settings.WEBSITE_USE_ZIP = this.blobSasUrl;
        delete settings.NEW_PROD_FUNCTION;
        return r.result;
      })
      .switchMap(r => this.cacheService.putArm(`${this.resourceId}/config/appSettings`, '2015-08-01', r))
      .subscribe(r => {
        this.show = false;
        this.loading = false;
      });
  }
}
