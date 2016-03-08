export interface IPortalService {
    inIFrame: boolean;
    initializeIframe(callback: (token: string) => void): void;
    openBlade(name: string) : void;
    openCollectorBlade(name: string, getAppSettingCallback: (appSettingName: string, cancelled: boolean) => void): void;

}