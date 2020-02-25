import { FunctionConfig } from './function-config';

export interface FunctionInfo {
  name: string;
  function_app_id?: string;
  script_root_path_href?: string;
  script_href?: string;
  config_href?: string;
  secrets_file_href?: string;
  href?: string;
  config: FunctionConfig;
  files: { [key: string]: string };
  test_data: string;
  invoke_url_template?: string;
  language?: string;
  test_data_href?: string;
}
