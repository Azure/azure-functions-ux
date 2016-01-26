import {FunctionConfig} from '../models/function-config';
import {VfsObject} from '../models/vfs-object';

export interface FunctionInfo {
    name: string;
    script_href: string;
    test_data_href: string;
    secrets_file_href: string;
    href: string;
    template_id: string;
    config: FunctionConfig;
    clientOnly: boolean;
    isDeleted: boolean;
}