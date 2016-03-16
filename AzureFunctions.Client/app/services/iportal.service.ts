export interface IPortalService {
    inIFrame: boolean;
    initializeIframe(initCallback: (token: string) => void, refreshCallback: (token: string) => void): void;
    openBlade(name: string) : void;
    openCollectorBlade(name: string, getAppSettingCallback: (appSettingName: string, cancelled: boolean) => void): void;
}