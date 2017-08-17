import { CacheService } from '../../shared/services/cache.service';
import { DeploymentData } from '../Models/deploymentData';
import { Observable} from 'rxjs/Rx';
import { EssentialColumn } from '../Models/EssentialItem';
export class providerHelper {
    constructor(protected _cacheService : CacheService){

    }
    public getEssentialItems(data: DeploymentData): Observable<EssentialColumn[]>
    {
        return Observable.of([]);
    }

}