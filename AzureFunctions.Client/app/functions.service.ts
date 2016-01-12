import {FUNCTIONS} from './mock-functions';
import {Injectable} from 'angular2/core';


@Injectable()
export class FunctionsService {
    getFunctions() {
        return Promise.resolve(FUNCTIONS);
    }
}