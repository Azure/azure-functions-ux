import {Observable} from 'rxjs/Rx';
import {Subscription} from '../models/subscription';
import {FunctionContainer} from '../models/function-container';

export abstract class IArmService {
    abstract getSubscriptions(): Observable<Subscription[]>;
    abstract getFunctionContainers(subscription: string): Observable<FunctionContainer[]>;
    abstract createFunctionContainer(subscription: string, geoRegion: string, name: string): Observable<FunctionContainer>;
    abstract getFunctionContainer(armId: string): Observable<FunctionContainer>;
    abstract updateMemorySize(functionContainer: FunctionContainer, memorySize: number): Observable<FunctionContainer>;
    abstract validateSiteNameAvailable(subscriptionId: string, containerName: string): Observable<boolean>;
    abstract getDynamicStampLocations(subscriptionId: string): Observable<{ name: string, displayName: string }[]>;
    abstract warmUpFunctionApp(armId: string): void;
}