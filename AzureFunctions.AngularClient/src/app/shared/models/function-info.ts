import { FunctionConfig } from '../models/function-config';

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
                break;
            case 'csx':
                lang = 'CSharp';
                break;
            case 'fsx':
                lang = 'FSharp';
                break;
            case 'js':
                lang = 'JavaScript';
                break;
            case 'php':
                lang = 'Php';
                break;
            case 'ps1':
                lang = 'Powershell';
                break;
            case 'py':
                lang = 'Python';
                break;
            case 'ts':
                lang = 'TypeScript';
                break;
        }
        return lang;
    }
}
