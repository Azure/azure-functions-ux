export interface BitbucketUser {
  username: string;
  display_name: string;
  account_status: string;
}

export interface BitbucketRepository {
  full_name: string;
  name: string;
}

export interface BitbucketBranch {
  name: string;
}

export interface BitbucketArrayResponse<T> {
  values: T[];
  pagelen: number;
  next?: string;
  page?: number;
  size?: number;
}
