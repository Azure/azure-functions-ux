declare module 'passport-azure-ad-oauth2' {
    export default class {
        constructor(options: StrategyOptions, userReducer: any);
        authenticate(req: any, options: any): void;
    }

    interface StrategyOptions {
        clientID: string;
        clientSecret: string;
        callbackURL: string;
        resource: string;
        tenant?: string;
        useCommonEndpoint?: boolean;
    }
}