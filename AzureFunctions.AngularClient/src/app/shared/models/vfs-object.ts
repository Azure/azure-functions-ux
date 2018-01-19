export interface VfsObject {
    name: string;
    mime: string;
    mtime?: string;
    href: string;
    isDirty?: boolean;
    isBinary?: boolean;
}
