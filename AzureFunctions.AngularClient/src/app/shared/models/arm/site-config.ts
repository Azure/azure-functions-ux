export interface SiteConfig{
    scmType : string;
    alwaysOn : boolean;
    cors : {
        allowedOrigins: string[]
    },
    apiDefinition : {
        url : string
    }
}
