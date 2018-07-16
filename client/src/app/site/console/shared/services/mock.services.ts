import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ArmObj } from '../../../../shared/models/arm/arm-obj';
import { Site } from '../../../../shared/models/arm/site';
import { PublishingCredentials } from '../../../../shared/models/publishing-credentials';

export class TestClipboard {
    getData(type: string) {
      return 'paste';
    }
  }

@Injectable()
export class MockCacheService {
    postArm(resourceId: string, force?: boolean, apiVersion?: string, content?: any, cacheKeyPrefix?: string): Observable<any> {
      return Observable.of(null);
    }
}

@Injectable()
export class MockSiteService {
    public siteObject = {
        properties: {
        hostNameSslStates: [{ name: '', hostType: 1 }]
        }
    };
    getSite(resourceId: string) {
        return Observable.of({
        isSuccessful: true,
        result: this.siteObject
        });
    }
}

@Injectable()
export class MockConsoleService {

    send(method: string, url: string, body?: any, headers?: Headers) {
        return Observable.of(null);
    }

    findMatchingStrings(allFiles: string[], cmd: string): string[] {
        if (!cmd || cmd === '') {
        return allFiles;
        }
        const ltOfDir: string[] = [];
        cmd = cmd.toLowerCase();
        allFiles.forEach(element => {
        if (element.toLowerCase().startsWith(cmd)) {
            ltOfDir.push(element);
        }
        });
        return ltOfDir;
    }

    sendResourceId(resourceId: string) {
        return;
    }

    sendSite(site: ArmObj<Site>) {
        return;
    }

    sendPublishingCredentials(publishingCredentials:  ArmObj<PublishingCredentials>) {
        return;
    }

    getResourceId(): Observable<string> {
        return Observable.of(null);
    }

    getSite(): Observable<ArmObj<Site>> {
        return Observable.of(null);
    }

    getPublishingCredentials(): Observable< ArmObj<PublishingCredentials>> {
        return Observable.of(null);
    }
}
