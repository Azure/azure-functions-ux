export interface IPortalService {
    inIFrame: boolean;
    initializeIframe(callback: (token: string) => void): void;
    openContinuousDeployment(): void;
    openAuthentication(): void;
    openCors(): void;
    openApiDefinition(): void;
    openApp(): void;
}