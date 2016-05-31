import {FunctionConfig} from '../models/function-config';
import {VfsObject} from '../models/vfs-object';

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
}