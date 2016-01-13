export interface VfsObject {
    name: string;
    size: number;
    mtime: string;
    crtime: string;
    mime: string;
    href: string;
    path: string;
    content: string;
    dirty: boolean;
}