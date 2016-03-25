import {Observable, Subscription as RxSubscription} from 'rxjs/Rx';

export interface IMonitoringService {
    getFunctionAppConsumptionData(): Observable<any>;
}