export interface VfsObject {
    name: string;
    mime?: string;
    href: string;
    content: string;
    isDirty: boolean;
    isNew: boolean;
}