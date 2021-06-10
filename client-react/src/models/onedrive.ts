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
}

export interface OneDriveArrayResponse<T> {
  values: T[];
}
