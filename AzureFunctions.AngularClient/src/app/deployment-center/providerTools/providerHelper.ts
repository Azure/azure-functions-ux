import { DeploymentData } from '../Models/deploymentData';
import { Observable} from 'rxjs/Rx';
import { EssentialColumn } from '../Models/EssentialItem';
export class providerHelper {
    public getEssentialItems(data: DeploymentData): Observable<EssentialColumn[]>
    {
        return Observable.of([]);
    }

}