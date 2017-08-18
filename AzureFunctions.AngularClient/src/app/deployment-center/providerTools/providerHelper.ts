import { TableRow } from '../Models/TableObjects';
import { HeaderObject } from '../Models/tableObjects';
import { PortalService } from '../../shared/services/portal.service';
import { CacheService } from '../../shared/services/cache.service';
import { DeploymentData } from '../Models/deploymentData';
import { Observable} from 'rxjs/Rx';
import { EssentialColumn } from '../Models/EssentialItem';
export class providerHelper {
    constructor(protected _cacheService : CacheService, protected _portalService: PortalService){

    }
    public getEssentialItems(data: DeploymentData): Observable<EssentialColumn[]>
    {
        return Observable.of([]);
    }

    public get showTable(){
        return false;
    }

    public getTableHeaders(data: DeploymentData): HeaderObject[] {
        return [];
    }

    public getTableItems(data: DeploymentData): TableRow[] {
        return [];
    }

    public get showLoadTestCommand(){
        return true;
    }

    public get showSyncCommand(){
        return true;
    }

    public get showDisconnectCommand(){
        return true;
    }

}