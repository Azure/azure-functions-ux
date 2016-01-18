import {VfsObject} from './vfs-object';

export interface FunctionInfo {
    name: string;
    script_root_path_href: string;
    script_href: string;
    config_href: string;
    test_data_href: string;
    href: string;
    template_id: string;
    config: any;
    expanded: boolean;
    files: VfsObject[];
    clientOnly: boolean;
    isDeleted: boolean;
}