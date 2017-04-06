export interface ISwaggerEditor {
    getDocument(callback: (json: string, error: any) => void): void;
    setDocument(swaggerObject): void;
}