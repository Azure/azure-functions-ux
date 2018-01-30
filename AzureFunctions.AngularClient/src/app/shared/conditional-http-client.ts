import { Preconditions as p } from './preconditions/preconditions';
import { Preconditions as Arm } from './preconditions/preconditions-arm';
import { Observable } from 'rxjs/Observable';
import { HttpResult } from 'app/shared/models/http-result';
import { Injector } from '@angular/core';

type AuthenticatedQuery<T> = (t: AuthToken) => Observable<T>;
type Query<T> = Observable<T> | AuthenticatedQuery<T>;
type AuthToken = string;
type Milliseconds = number;
interface ExecuteOptions {
    retryCount: number;
    retryBounce: Milliseconds;
}

export class ConditionalHttpClient {

    private readonly preconditionsMap: p.PreconditionMap = {} as p.PreconditionMap;
    private readonly conditions: p.HttpPreconditions[];

    constructor(injector: Injector, private getToken: (resourceId: string) => Observable<string>, ...defaultConditions: p.HttpPreconditions[]) {

        this.conditions = defaultConditions;

        this.preconditionsMap['NoClientCertificate'] = new p.NoClientCertificatePrecondition(injector);
        this.preconditionsMap['NotOverQuota'] = new p.NotOverQuotaPrecondition(injector);
        this.preconditionsMap['NotStopped'] = new p.NotStoppedPrecondition(injector);
        this.preconditionsMap['ReachableLoadballancer'] = new p.ReachableLoadballancerPrecondition(injector);
        this.preconditionsMap['RuntimeAvailable'] = new p.RuntimeAvailablePrecondition(injector, getToken);
        this.preconditionsMap['HasPermissions'] = new Arm.HasPermissionsPrecondition(injector);
        this.preconditionsMap['NoReadonlyLock'] = new Arm.NoReadonlyLockPrecondition(injector);
    }

    execute<T>(input: p.PreconditionInput, query: Query<T>, executeOptions?: ExecuteOptions) {
        return this.executeWithConditions(this.conditions, input, query, executeOptions);
    }

    executeWithConditions<T>(
        preconditions: p.HttpPreconditions[],
        input: p.PreconditionInput,
        query: Query<T>,
        executeOptions?: ExecuteOptions): Observable<HttpResult<T>> {

        const errorMapper = (error: p.PreconditionResult) => Observable.of({
            isSuccessful: false,
            error: {
                preconditionSuccess: false,
                errorId: error.errorId
            },
            result: null
        });

        const observableQuery = typeof query === 'function'
            ? this.getToken(input.resourceId).take(1).concatMap(t => query(t))
            : query;

        const successMapper = () => observableQuery
            .map(r => ({
                isSuccessful: true,
                error: null,
                result: r
            }))
            .catch((e: any) => {

                return Observable.of({
                    isSuccessful: false,
                    error: {
                        preconditionSuccess: true,
                        errorId: e,
                        message: this._getErrorMessage(e)
                    },
                    result: null
                })
            });

        if (preconditions.length > 0) {
            const checkPreconditions = Observable.forkJoin(
                preconditions
                    .map(i => this.preconditionsMap[i])
                    .map(i => input ? i.check(input) : Observable.of({ conditionMet: true, errorId: null })));

            return checkPreconditions
                .map(preconditionResults => preconditionResults.find(r => !r.conditionMet))
                .concatMap(failedPreconditionResult =>
                    failedPreconditionResult
                        ? errorMapper(failedPreconditionResult)
                        : successMapper());
        } else {
            return successMapper();
        }
    }

    // We have no idea what kind of observable will be failing, so we make a best
    // effort to come up with some kind of useful error.
    private _getErrorMessage(e: any){
        let mesg = 'An error occurred';
        if(typeof e === 'string'){
            mesg = e;
        } else if(e.statusText){
            if(e.url){
                mesg = `${e.statusText} - ${e.url}`;
            } else{
                mesg = e.statusText;
            }
        }

        return mesg;
    }
}
