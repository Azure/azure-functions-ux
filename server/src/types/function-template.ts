export interface FunctionTemplate {
    id: string
    function: any;
    metadata: any
    files: { [name: string]: string };
    runtime: string;
}