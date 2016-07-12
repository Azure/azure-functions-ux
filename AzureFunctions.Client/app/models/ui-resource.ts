﻿
export interface UIResource {
    url: string;
    mobileWebClient: string;
    ibizaUrl: string;
    monacoUrl: string;
    contentDownloadUrl: string;
    gitUrl: string;
    timeLeft: number;
    appService: AppService ;
    isRbacEnabled: boolean;
    templateName: string;
    isExtended: boolean;
    csmId : string;
}

export enum AppService {
    Web = 0,
    Mobile,
    Api,
    Logic,
    Function
}
