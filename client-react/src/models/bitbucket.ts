export interface BitbucketUser {
  username: string;
  display_name: string;
  account_status: string;
}

export interface BitbucketRepository {
  full_name: string;
  html_url: string;
  branches_url: string;
}

export interface BitbucketBranch {
  name: string;
}
