import { ArmObj } from 'app/shared/models/arm/arm-obj';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Response } from '@angular/http';
import { SiteConfigDescriptor, ConfigType } from 'app/shared/resourceDescriptors';
import { CacheService } from 'app/shared/services/cache.service';

export type ArmPatchObj<T> = { full: ArmObj<T>, patchedProperties: ArmObj<any> }

export interface SaveInfo<T> {
    patches: ArmPatchObj<T>[],
    responseSubject: Subject<Response>
}

export class SiteConfigPatchUtil {
    private _saveInfoMap: { [key: string]: SaveInfo<any> };

    constructor(private _cacheService: CacheService) {
        this._saveInfoMap = {};
    }

    public mergeForSubmit(resourceConfigId: string, configPatch: ArmPatchObj<any>, error?: any): Observable<Response> {
        if (error) {
            return Observable.throw(error);
        }
        else {
            let saveInfo: SaveInfo<any> = this._saveInfoMap[resourceConfigId];

            if (!saveInfo) {
                saveInfo = {
                    patches: [],
                    responseSubject: new Subject<Response>()
                };
                this._saveInfoMap[resourceConfigId] = saveInfo;
            }

            saveInfo.patches.push(configPatch);

            return saveInfo.responseSubject;
        }
    }

    public clear() {
        if (this._saveInfoMap) {
            for (let key in this._saveInfoMap) {
                if (this._saveInfoMap[key].responseSubject) {
                    this._saveInfoMap[key].responseSubject.complete();
                    this._saveInfoMap[key].responseSubject = null;
                }
            }
            this._saveInfoMap = {};
        }
    }

    public mergeAndSubmit() {
        if (this._saveInfoMap) {
            for (let key in this._saveInfoMap) {
                const saveInfo = this._saveInfoMap[key];

                if (saveInfo && saveInfo.responseSubject) {
                    const configResourceId = key;

                    try {
                        if (!saveInfo.patches || saveInfo.patches.length === 0) {
                            throw 'No configuration object provided.';
                        }

                        const patches = saveInfo.patches;
                        const descriptor = new SiteConfigDescriptor(configResourceId);

                        if (patches.length > 1 && !descriptor.canMerge) {
                            throw `Merge not supported for config type '${ConfigType[descriptor.configType]}'.`;
                        }

                        const cumulativeProperties = {};

                        patches.forEach(patch => {
                            this._merge(cumulativeProperties, patch.patchedProperties, true);
                        })

                        const finalConfigArm: ArmObj<any> = this._simpleDeepCopy(patches[0].full);

                        if (descriptor.supprtsPatch) {
                            finalConfigArm.properties = cumulativeProperties;
                            this._subscribe(this._cacheService.patchArm(configResourceId, null, finalConfigArm), saveInfo);
                        }
                        else {
                            this._merge(finalConfigArm.properties, cumulativeProperties, true);
                            this._subscribe(this._cacheService.putArm(configResourceId, null, finalConfigArm), saveInfo);
                        }
                    }
                    catch (e) {
                        saveInfo.responseSubject.error(e);
                        saveInfo.responseSubject.complete();
                        saveInfo.responseSubject = null;
                    }
                }
            }
        }
    }

    private _subscribe(responseObservable: Observable<Response>, saveInfo: SaveInfo<any>) {
        responseObservable.subscribe(
            next => {
                saveInfo.responseSubject.next(next);
                saveInfo.responseSubject.complete();
                saveInfo.responseSubject = null;
            },
            error => {
                saveInfo.responseSubject.error(error);
                saveInfo.responseSubject.complete();
                saveInfo.responseSubject = null;
            }
        );
    }

    private _merge(target: { [key: string]: any }, patch: { [key: string]: any }, overwriteExisting?: boolean) {
        if (target === null || target === undefined || !patch) {
            return;
        }
        else {
            for (let name in patch) {
                if (!target.hasOwnProperty(name) || overwriteExisting) {
                    target[name] = this._simpleDeepCopy(patch[name]);
                }
                else {
                    throw `Failed to merge. Property ${name} already exits on target config.`;
                }
            }
        }
    }

    private _simpleDeepCopy(obj: any): any {
        return JSON.parse(JSON.stringify(obj));
    }
}