import { FunctionConfig } from './function-config';

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
