import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

export interface IContainerMultiConfigService {
    extractConfig(input): Subject<string>;
}

@Injectable()
export class ContainerMultiConfigService implements IContainerMultiConfigService {
    constructor() {}

    public extractConfig(input): Subject<string> {
        const result$ = new Subject<string>();
        const reader = new FileReader();
        reader.onload = () => {
            result$.next(reader.result.toString());
        };
        reader.readAsText(input.files[0]);
        return result$;
    }
}
