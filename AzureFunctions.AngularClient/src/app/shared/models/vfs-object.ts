export interface VfsObject {
    name: string;
    mime: string;
    href: string;
    isDirty?: boolean;
    isBinary?: boolean;
}