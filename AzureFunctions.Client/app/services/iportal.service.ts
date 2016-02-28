export interface IPortalService {
    inIFrame: boolean;
    initializeIframe(callback: (token: string) => void): void;
    openSettings(): void;
}