export interface DropboxUser {
  name: {
    display_name: string;
  };
}

export interface DropboxFolder {
  name: string;
}

export interface DropboxArrayResponse {
  entries: DropboxFolder[];
  cursor: string;
  has_more: boolean;
}
