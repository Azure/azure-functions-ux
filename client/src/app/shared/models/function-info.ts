import { FunctionAppContext } from './../function-app-context';
import { FunctionConfig } from '../models/function-config';

export interface FunctionInfo {
  name: string;
  function_app_id: string;
  script_root_path_href: string;
  script_href: string;
  config_href: string;
  secrets_file_href: string;
  href: string;
  config: FunctionConfig;
  files: { [key: string]: string };
  test_data: string;
  invoke_url_template: string;
  language: string;
  isDisabled: boolean;
  test_data_href?: string;

  // note (allisonm): These properties are used in embedded scenarios only
  context?: FunctionAppContext;
  trigger_url?: string;
  entity?: string;
}

export class FunctionInfoHelper {
  public static getLanguage(fi: FunctionInfo): string {
    if (!!fi.language) {
      return fi.language;
    }
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
