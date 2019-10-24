export interface PublishingUser {
  name?: string;
  publishingUserName: string;
  publishingPassword: string;
  publishingPasswordHash?: string;
  publishingPasswordHashSalt?: string;
  metadata?: any;
  isDeleted?: boolean;
  scmUri?: string;
}
