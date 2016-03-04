export interface IPortalService {
    inIFrame: boolean;
    initializeIframe(callback: (token: string) => void): void;
    openBlade(name: string) : void;
    openStorageBlade(name: string, addResourceCallback: (appSettingName: string) => void): void;

}