export interface VfsObject {
  name: string;
  mime: string;
  href: string;
  mtime?: string;
  isDirty?: boolean;
  isBinary?: boolean;
  parsedTime?: Date;
}
