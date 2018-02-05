import { ArmError, HttpError } from './models/http-result';
import { Preconditions as p } from './preconditions';
import { Observable } from 'rxjs/Observable';
import { HttpResult, HttpErrorResponse } from 'app/shared/models/http-result';
import { Injector } from '@angular/core';
import { errorIds } from 'app/shared/models/error-ids';

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
                errorId: error.errorId,
                result: error
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
                    error: this._getErrorObj(e),
                    result: null
                });
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
    private _getErrorObj(e: any) {
        let mesg: string;
        let errorId = '/errors/unknown-error';

        if (typeof e === 'string') {
            mesg = e;
        } else {
            const httpError = e as HttpErrorResponse<ArmError>;
            let body: ArmError;
            if (httpError.json) {
                try {
                    body = httpError.json();
                } catch (e) {
                    // Lots of Functions API's don't return JSON even though they have a JSON content type
                }

                if (body && body.error) {
                    mesg = body.error.message;

                    if (httpError.status === 401) {
                        errorId = errorIds.armErrors.noAccess;
                    } else if (httpError.status === 409 && body.error.code === 'ScopeLocked') {
                        errorId = errorIds.armErrors.scopeLocked;
                    }
                }
            }

            if (!mesg && httpError.statusText && httpError.url) {
                mesg = `${httpError.statusText} - ${httpError.url}`;
            }
        }

        return <HttpError>{
            errorId: errorId,
            message: mesg,
            result: e
        };
    }
}
