export interface OneDriveUser {
  displayName: string;
  id: string;
  status: OneDriveUserStatus;
}

export interface OneDriveUserStatus {
  state: string;
}

export interface OneDriveFolder {
  name: string;
  webUrl: string;
}

export interface OneDriveArrayResponse<T> {
  values: T[];
}
