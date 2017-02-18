import {Http} from '@angular/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {Constants} from '../models/constants';

@Injectable()
export class ConfigService {
    public inIFrame: boolean;
    private azureResourceManagerEndpoint: string;

    constructor(private http: Http) {
    }

    loadConfig() {
        console.log('Loading config...');
        var observable = this.http.get(Constants.serviceHost + `api/config`)
            .map<any>((response) => {
                var res = response.json();

                return res;
            });

        observable.subscribe(config => {
            console.log(config);

            this.setConfig(config);
        });

        return observable.toPromise();
    }

    setConfig(config: any) {
        this.azureResourceManagerEndpoint = config.AzureResourceManagerEndpoint;
    }

    getAzureResourceManagerEndpoint() {
        return this.azureResourceManagerEndpoint;
    }
}
