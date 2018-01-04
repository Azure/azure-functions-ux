import { FunctionAppContext } from './function-app-context';
import { Preconditions as p } from './preconditions';
import { CacheService } from 'app/shared/services/cache.service';
import { Observable } from 'rxjs/Observable';
import { FunctionAppHttpResult } from 'app/shared/models/function-app-http-result';
import { LogService } from './services/log.service';
import 'rxjs/add/observable/forkJoin';

type AuthenticatedQuery<T> = (t: AuthToken) => Observable<T>;
type Query<T> = Observable<T> | AuthenticatedQuery<T>;
type AuthToken = string;
type ErrorId = string;
type Milliseconds = number;
interface ExecuteOptions {
    retryCount: number;
    retryBounce: Milliseconds;
}

export class ConditionalHttpClient {

    private readonly preconditionsMap: p.PreconditionMap = {} as p.PreconditionMap;
    private readonly conditions: p.HttpPreconditions[];

    constructor(cacheService: CacheService, logService: LogService, private getToken: (context: FunctionAppContext) => Observable<string>, ...defaultConditions: p.HttpPreconditions[]) {

        this.conditions = defaultConditions;

        this.preconditionsMap['NoClientCertificate'] = new p.NoClientCertificatePrecondition(cacheService, logService);
        this.preconditionsMap['NotOverQuota'] = new p.NotOverQuotaPrecondition(cacheService, logService);
        this.preconditionsMap['NotStopped'] = new p.NotStoppedPrecondition(cacheService, logService);
        this.preconditionsMap['ReachableLoadballancer'] = new p.ReachableLoadballancerPrecondition(cacheService, logService);
        this.preconditionsMap['RuntimeAvailable'] = new p.RuntimeAvailablePrecondition(cacheService, logService, getToken);
    }

    execute<T>(context: FunctionAppContext, query: Query<T>, executeOptions?: ExecuteOptions) {
        return this.executeWithConditions(this.conditions, context, query, executeOptions);
    }

    executeWithConditions<T>(preconditions: p.HttpPreconditions[], context: FunctionAppContext, query: Query<T>, executeOptions?: ExecuteOptions): Observable<FunctionAppHttpResult<T>> {
        const errorMapper = (error: p.PreconditionResult) => Observable.of({
            isSuccessful: false,
            error: {
                errorId: error.errorId
            },
            result: null
        });

        const observableQuery = typeof query === 'function'
            ? this.getToken(context).take(1).concatMap(t => query(t))
            : query;

        const successMapper = () => observableQuery
            .map(r => ({
                isSuccessful: true,
                error: null,
                result: r
            }))
            .catch((e: ErrorId) => Observable.of({
                isSuccessful: false,
                error: {
                    errorId: e
                },
                result: null
            }));

        return preconditions.length > 0
            ? Observable.forkJoin(preconditions
                .map(i => this.preconditionsMap[i])
                .map(i => context ? i.check(context) : Observable.of({ conditionMet: true, errorId: null })))
                .map(preconditionResults => preconditionResults.find(r => !r.conditionMet))
                .concatMap(maybeError => maybeError ? errorMapper(maybeError) : successMapper())
            : successMapper();
    }
}
