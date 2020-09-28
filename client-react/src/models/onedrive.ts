export interface OneDriveUser {
  createdBy: {
    user: {
      displayName: string;
    };
  };
  id: string;
}

export interface OneDriveFolder {
  name: string;
  webUrl: string;
}

export interface OneDriveArrayResponse<T> {
  values: T[];
}
