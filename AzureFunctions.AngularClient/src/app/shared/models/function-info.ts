import { FunctionConfig } from '../models/function-config';
import { FunctionApp } from '../function-app';

export interface FunctionInfo {
    name: string;
    script_root_path_href: string;
    script_href: string;
    secrets_file_href: string;
    href: string;
    template_id: string;
    config: FunctionConfig;
    clientOnly: boolean;
    isDeleted: boolean;
    test_data: string;
    config_href: string;
    functionApp: FunctionApp;
}

export class FunctionInfoHelper {
    public static getLanguage(fi: FunctionInfo): string {
        const fileName = fi.script_href.substring(fi.script_href.lastIndexOf('/') + 1);
        const fileExt = fileName.split('.')[1].toLowerCase();
        let lang = '';

        switch (fileExt) {
            case 'sh':
                lang = 'Bash';
                break;
            case 'bat':
                lang = 'Batch';
                // bat
                break;
            case 'csx':
                lang = 'CSharp';
                // csharp
                break;
            case 'fsx':
                lang = 'FSharp';
                // fsharp
                break;
            case 'js':
                lang = 'JavaScript';
                // javascript
                break;
            case 'php':
                lang = 'Php';
                break;
            case 'ps1':
                lang = 'Powershell';
                // powershell
                break;
            case 'py':
                lang = 'Python';
                // python
                break;
            case 'ts':
                lang = 'TypeScript';
                // typescript
                break;
        }
        return lang;
    }
}
