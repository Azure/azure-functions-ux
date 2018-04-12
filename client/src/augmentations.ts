// https://stackoverflow.com/a/44813884/3234163
// augmentations.ts
import { Operator } from 'rxjs/Operator';
import { Observable } from 'rxjs/Observable';

declare module 'rxjs/Subject' {
    interface Subject<T> {
        lift<R>(operator: Operator<T, R>): Observable<R>;
    }
}