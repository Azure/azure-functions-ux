// TODO (andimarc): Remove this if we don't end up using it
export interface VfsObject {
  name: string;
  mime: string;
  mtime?: string;
  href: string;
  isDirty?: boolean;
  isBinary?: boolean;
  parsedTime?: Date;
}
